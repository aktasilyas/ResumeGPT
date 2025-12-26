"""Stripe payment service with fallback."""

# Try importing Stripe checkout
try:
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
except ImportError:
    # Fallback for development
    class StripeCheckout:
        def __init__(self, api_key: str, webhook_url: str = None):
            self.api_key = api_key
            self.webhook_url = webhook_url

        async def create_checkout_session(self, req):
            # Development fallback
            return type('Session', (), {
                'session_id': 'dev_session',
                'url': 'https://example.com/checkout'
            })()

        async def get_checkout_status(self, session_id: str):
            # Development fallback
            return type('Status', (), {
                'status': 'complete',
                'payment_status': 'unpaid',
                'amount_total': 0,
                'currency': 'usd'
            })()

        async def handle_webhook(self, body, signature):
            # Development fallback
            return type('WebhookResponse', (), {
                'payment_status': 'unpaid',
                'session_id': 'dev_session',
                'metadata': {}
            })()
