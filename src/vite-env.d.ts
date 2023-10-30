/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SOCKET_PORT: string,
    readonly VITE_BACKEND_PORT: string,
    readonly VITE_SOCKET_HOST: string,
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
