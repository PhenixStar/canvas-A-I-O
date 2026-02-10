module.exports = {
    apps: [
        {
            name: "canvas-ws",
            script: "npm",
            args: "run collab:server",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "development",
                WS_PORT: 3001,
                WS_HEALTH_PORT: 3002,
                LOG_LEVEL: "debug",
            },
            env_production: {
                NODE_ENV: "production",
                WS_PORT: 3001,
                WS_HEALTH_PORT: 3002,
                LOG_LEVEL: "info",
            },
            error_file: "./logs/ws-error.log",
            out_file: "./logs/ws-out.log",
            merge_logs: true,
            time: true,
        },
    ],
}
