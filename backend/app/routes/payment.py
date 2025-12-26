"""Stripe payment routes."""
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request, Depends
from app.models.user import User
from app.models.payment import CreateCheckoutRequest, CheckoutSessionRequest
from app.core.database import db
from app.core.security import get_current_user
from app.core.config import settings
from app.utils.stripe_service import StripeCheckout
from app.core.logging import logger

router = APIRouter(prefix="/stripe", tags=["Payments"])


@router.post("/create-checkout")
async def create_checkout_session(
    request: CreateCheckoutRequest,
    http_request: Request,
    user: User = Depends(get_current_user)
):
    """Create Stripe checkout session for subscription."""
    try:
        api_key = settings.stripe_api_key
        if not api_key:
            raise HTTPException(status_code=500, detail="Stripe not configured")

        host_url = str(http_request.base_url).rstrip("/")
        webhook_url = f"{host_url}/api/webhook/stripe"

        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

        success_url = f"{request.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/dashboard"

        checkout_request = CheckoutSessionRequest(
            amount=settings.subscription_price,
            currency=settings.subscription_currency,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user.user_id,
                "email": user.email,
                "type": "subscription"
            }
        )

        session = await stripe_checkout.create_checkout_session(checkout_request)

        # Create payment transaction record
        await db.payment_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "session_id": session.session_id,
            "user_id": user.user_id,
            "email": user.email,
            "amount": settings.subscription_price,
            "currency": settings.subscription_currency,
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        logger.info(f"Checkout session created: {session.session_id}", extra={"user_id": user.user_id})
        return {"url": session.url, "session_id": session.session_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create checkout error: {str(e)}", extra={"user_id": user.user_id, "error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.get("/status/{session_id}")
async def get_checkout_status(session_id: str, user: User = Depends(get_current_user)):
    """Get checkout session status and update user subscription."""
    try:
        api_key = settings.stripe_api_key
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")

        status = await stripe_checkout.get_checkout_status(session_id)

        # Update transaction record
        transaction = await db.payment_transactions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )

        if (transaction and
            transaction.get("payment_status") != "paid" and
            status.payment_status == "paid"):

            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )

            # Update user to pro
            subscription_end = (
                datetime.now(timezone.utc) +
                timedelta(days=settings.subscription_duration_days)
            ).isoformat()

            await db.users.update_one(
                {"user_id": user.user_id},
                {"$set": {
                    "is_pro": True,
                    "subscription_end": subscription_end
                }}
            )

            logger.info(f"User upgraded to pro: {user.user_id}")

        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get checkout status error: {str(e)}", extra={"session_id": session_id, "error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="Failed to retrieve checkout status")


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks."""
    try:
        api_key = settings.stripe_api_key
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")

        body = await request.body()
        signature = request.headers.get("Stripe-Signature")

        webhook_response = await stripe_checkout.handle_webhook(body, signature)

        if webhook_response.payment_status == "paid":
            user_id = webhook_response.metadata.get("user_id")
            if user_id:
                subscription_end = (
                    datetime.now(timezone.utc) +
                    timedelta(days=settings.subscription_duration_days)
                ).isoformat()

                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "is_pro": True,
                        "subscription_end": subscription_end
                    }}
                )

                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {
                        "payment_status": "paid",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )

                logger.info(f"Webhook processed: User {user_id} upgraded to pro")

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Webhook error: {str(e)}", extra={"error_type": type(e).__name__})
        return {"status": "error", "message": str(e)}
