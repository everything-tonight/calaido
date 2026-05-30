import { ofetch } from 'ofetch'

const defaultHTTPClient = ofetch.create({
  baseURL: import.meta.env.CLIENT_URL_GATEWAY,
  retry: 3,
  retryDelay: 500,
  headers: {
    'Content-Type': 'application/json',
  },
})

export {
  defaultHTTPClient,
}
