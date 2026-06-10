import PocketBase from 'pocketbase'

export const pb = new PocketBase('/')

// Prevent react-query from triggering AbortController cancellations
pb.autoCancellation(false)
