import { GALOY_GRAPHQL_ENDPOINT } from "../../config/index"
import fetch from "node-fetch"
import { gql } from "apollo-server"

const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
}

const getAccountIds = async () => {
  const query = gql`
    query listWalletIds {
      listWalletIds(walletCurrency: BTC)
    }
  `
  try {
    const response = await fetch(GALOY_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    })
    const result = await response.json()
    return result.data.listWalletIds
  } catch (err) {
    return err
  }
}

export const GaloyAccountService = (): IAccountService => {
  const fetchAccounts = async (): Promise<Account[] | Error> => {
    try {
      const accounts: Account[] = []
      const accountIds = await getAccountIds()
      for (const id of accountIds) {
        const query = gql`query wallet{
          wallet(walletId: "${id}"){
            id
            balance
          }
        }`
        const response = await fetch(GALOY_GRAPHQL_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify({ query }),
        })
        const result = await response.json()
        const { wallet } = result.data
        accounts.push({
          accountId: wallet.id,
          balance: wallet.balance,
        })
      }
      return accounts
    } catch (err) {
      return err
    }
  }
  return { fetchAccounts }
}
