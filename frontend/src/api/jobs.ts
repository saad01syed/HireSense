import type { Job } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export type MarketInsightsResponse = {
  overview: {
    total_jobs: number
    remote_jobs: number
    hybrid_jobs: number
    onsite_jobs: number
  }
  trending_skills: { name: string; count: number }[]
  top_locations: { city: string; count: number }[]
  top_companies: { name: string; count: number }[]
}

export async function fetchJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/jobs/`)

  if (!response.ok) {
    throw new Error('Failed to fetch jobs.')
  }

  return response.json()
}

export async function fetchJob(jobId: number): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch job details.')
  }

  return response.json()
}

export async function fetchMarketInsights(): Promise<MarketInsightsResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/market-insights`)

  if (!response.ok) {
    throw new Error('Failed to fetch market insights.')
  }

  return response.json()
}