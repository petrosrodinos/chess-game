export const AppUrls = {
    billing: `${process.env.APP_URL}/dashboard/billing/account`,
} as const;

export const ApiUrls = {
    api_url: process.env.API_URL,
    voices_audio_url: (token: string) => `${process.env.API_URL}/voices/audio/${token}.mp3`,
    campaign_email_open: (campaign_uuid: string) => `${process.env.API_URL}/analytics-events/campaign/email/open/${campaign_uuid}`,
    booking_email_open: (booking_uuid: string) => `${process.env.API_URL}/analytics-events/booking/email/open/${booking_uuid}`,
    campaign_call_webhook: (campaign_uuid: string) => `${process.env.API_URL}/calls/webhook/${campaign_uuid}`,
} as const;