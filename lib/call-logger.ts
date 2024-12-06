import { VapiCall } from '@/types/vapi';
import { createCallLog } from './airtable/call-logs';
import { updateClient } from './airtable/clients';
import { updateCampaign } from './airtable/campaigns';
import { updateCustomer } from './airtable/customers';

export async function logCall(
  clientId: string,
  campaignId: string | undefined,
  call: VapiCall,
  transcript: string[],
  notes: string = ''
) {
  try {
    // 1. Create call log
    const callLogResponse = await createCallLog(
      clientId,
      campaignId,
      call,
      transcript,
      notes
    );

    if (!callLogResponse.success) {
      throw new Error(callLogResponse.error);
    }

    // 2. Update client metrics
    await updateClient(clientId, {
      totalCalls: { increment: 1 },
      callsThisMonth: { increment: 1 },
      connectedCalls: call.status === 'ended' ? { increment: 1 } : 0,
      voicemails: call.endedReason?.includes('voicemail') ? { increment: 1 } : 0,
    });

    // 3. Update campaign metrics if campaignId provided
    if (campaignId) {
      await updateCampaign(campaignId, {
        calls: call.status === 'ended' ? 1 : 0,
        successRate: call.status === 'ended' ? 100 : 0
      });
    }

    // 4. Update customer status
    if (call.customer?.number) {
      await updateCustomer(call.customer.number, {
        status: 'contacted',
        lastContact: new Date().toISOString().split('T')[0],
        notes: notes ? `${notes}\n\nCall transcript:\n${transcript.join('\n')}` : '',
      });
    }

    return {
      success: true,
      callLog: callLogResponse.data
    };
  } catch (error) {
    console.error('Error logging call:', error);
    throw error;
  }
}