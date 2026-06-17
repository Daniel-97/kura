import type { ComponentType } from 'react'
import Login from '@/features/auth/Login'
import Register from '@/features/auth/Register'
import Timeline from '@/features/records/Timeline'
import RecordForm from '@/features/records/RecordForm'
import Pressione from '@/features/blood-pressure/Pressione'
import Categories from '@/features/categories/Categories'

export interface AppRoute {
  path: string
  component: ComponentType
  requiresAuth: boolean
}

export const routes: AppRoute[] = [
  { path: '/login',           component: Login,      requiresAuth: false },
  { path: '/register',        component: Register,   requiresAuth: false },
  { path: '/',                component: Timeline,   requiresAuth: true },
  { path: '/new',             component: RecordForm, requiresAuth: true },
  { path: '/record/:id/edit', component: RecordForm, requiresAuth: true },
  { path: '/blood-pressure',  component: Pressione,  requiresAuth: true },
  { path: '/categories',      component: Categories, requiresAuth: true },
]
