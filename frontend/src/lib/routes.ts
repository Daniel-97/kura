import { createElement, type ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import Login from '@/features/auth/Login'
import Register from '@/features/auth/Register'
import Dashboard from '@/features/dashboard/Dashboard'
import Timeline from '@/features/records/Timeline'
import RecordForm from '@/features/records/RecordForm'
import Measurements from '@/features/measurements/Measurements'
import Categories from '@/features/categories/Categories'

// Old bookmarks: /blood-pressure now lives inside /measurements.
const BloodPressureRedirect = () =>
  createElement(Navigate, { to: '/measurements', replace: true })


export interface AppRoute {
  path: string
  component: ComponentType
  requiresAuth: boolean
}

export const routes: AppRoute[] = [
  { path: '/login',           component: Login,      requiresAuth: false },
  { path: '/register',        component: Register,   requiresAuth: false },
  { path: '/',                component: Dashboard,  requiresAuth: true },
  { path: '/timeline',        component: Timeline,   requiresAuth: true },
  { path: '/new',             component: RecordForm, requiresAuth: true },
  { path: '/record/:id/edit', component: RecordForm, requiresAuth: true },
  { path: '/measurements',    component: Measurements, requiresAuth: true },
  { path: '/blood-pressure',  component: BloodPressureRedirect, requiresAuth: true },
  { path: '/categories',      component: Categories, requiresAuth: true },
]
