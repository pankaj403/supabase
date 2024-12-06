# CheezWire CRM

## Environment Setup

1. Create a `.env.local` file in the root directory
2. Add the following environment variables:

```
NEXT_PUBLIC_VAPI_TOKEN=your_vapi_token_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID=your_phone_number_id_here
```

Replace the placeholder values with your actual Vapi credentials:

- `VAPI_TOKEN`: Your Vapi API key
- `VAPI_ASSISTANT_ID`: The ID of your configured Vapi assistant
- `VAPI_PHONE_NUMBER_ID`: The ID of your configured phone number in Vapi

Note: The system requires valid Vapi credentials to function. There is no mock/development mode.