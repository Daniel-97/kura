/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOW_REGISTRATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
