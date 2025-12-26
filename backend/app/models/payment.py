"""Payment models."""
from pydantic import BaseModel


class CreateCheckoutRequest(BaseModel):
    origin_url: str


# Stripe integration models (with fallback for development)
try:
    from emergentintegrations.payments.stripe.checkout import CheckoutSessionRequest
except ImportError:
    class CheckoutSessionRequest(BaseModel):
        amount: float
        currency: str
        success_url: str
        cancel_url: str
        metadata: dict = {}
