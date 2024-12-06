import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from './airtable/clients'
import { createCampaign, updateCampaign } from './airtable/campaigns'
import { getClients, getCampaigns } from './airtable'
import { Client, Campaign } from '@/types'

interface ClientStore {
  clients: Client[]
  campaigns: Campaign[]
  getClient: (id: string | string[]) => Client | undefined
  getClientCampaigns: (clientId: string) => Campaign[]
  addClient: (name: string) => Promise<Client>
  addCampaign: (clientId: string, campaign: Omit<Campaign, 'id' | 'clientId'>) => Promise<Campaign>
  updateCampaignStatus: (campaignId: string, status: Campaign['status']) => Promise<void>
  incrementCalls: (clientId: string) => void
  setCampaigns: (campaigns: Campaign[]) => void
  refreshData: () => Promise<void>
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],
      campaigns: [],
      
      getClient: (id: string | string[]) => {
        const clientId = Array.isArray(id) ? id[0] : id
        return get().clients.find(client => client.id === clientId)
      },

      getClientCampaigns: (clientId: string) => {
        return get().campaigns.filter(campaign => campaign.clientId === clientId)
      },
      
      addClient: async (name: string) => {
        const newClient: Omit<Client, 'id'> = {
          name,
          phone: '',
          status: 'active',
          dateAdded: new Date().toISOString().split('T')[0],
          activeCampaigns: 0,
          totalCalls: 0,
          callsThisMonth: 0,
          connectedCalls: 0,
          voicemails: 0,
          successRate: 0,
          averageCallDuration: '0:00',
          monthlyCallDuration: 0,
          lastMonthlyReset: new Date().toISOString().split('T')[0],
        }
        
        const response = await createClient(newClient)
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to create client')
        }
        
        const clientData = response.data
        set(state => ({
          ...state,
          clients: [...state.clients, clientData]
        }))
        
        return clientData
      },

      addCampaign: async (clientId: string, campaignData) => {
        const client = get().getClient(clientId)
        if (!client) {
          throw new Error("Client not found")
        }

        const response = await createCampaign({
          clientId,
          ...campaignData,
        })

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to create campaign')
        }

        const newCampaign = response.data
        set(state => ({
          ...state,
          campaigns: [...state.campaigns, newCampaign],
          clients: state.clients.map(c => 
            c.id === clientId 
              ? { ...c, activeCampaigns: c.activeCampaigns + 1 }
              : c
          )
        }))

        return newCampaign
      },

      updateCampaignStatus: async (campaignId: string, status: Campaign['status']) => {
        const response = await updateCampaign(campaignId, { status })
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to update campaign status')
        }

        const updatedCampaign = response.data
        const client = get().getClient(updatedCampaign.clientId)

        if (client) {
          set(state => ({
            ...state,
            campaigns: state.campaigns.map(c => 
              c.id === campaignId ? updatedCampaign : c
            ),
            clients: state.clients.map(c => 
              c.id === client.id 
                ? { 
                    ...c, 
                    activeCampaigns: c.activeCampaigns + (status === 'active' ? 1 : -1)
                  }
                : c
            )
          }))
        }
      },

      incrementCalls: (clientId: string) => {
        set(state => ({
          ...state,
          clients: state.clients.map(client => 
            client.id === clientId
              ? {
                  ...client,
                  totalCalls: client.totalCalls + 1,
                  callsThisMonth: client.callsThisMonth + 1,
                  connectedCalls: client.connectedCalls + 1,
                  voicemails: Math.random() < 0.2 ? client.voicemails + 1 : client.voicemails,
                }
              : client
          )
        }))
      },

      setCampaigns: (campaigns: Campaign[]) => {
        set(state => ({ ...state, campaigns }))
      },

      refreshData: async () => {
        try {
          const [clientsResponse, campaignsResponse] = await Promise.all([
            getClients(),
            getCampaigns()
          ])

          if (!clientsResponse.success || !campaignsResponse.success) {
            throw new Error(
              clientsResponse.error || campaignsResponse.error || 'Failed to refresh data'
            )
          }

          set(() => ({
            clients: clientsResponse.data,
            campaigns: campaignsResponse.data
          }))
        } catch (error) {
          console.error('Error refreshing data:', error)
          throw error
        }
      }
    }),
    {
      name: 'client-store',
      skipHydration: true,
    }
  )
)

// Initialize data on first load
if (typeof window !== 'undefined') {
  useClientStore.getState().refreshData().catch(console.error)
}