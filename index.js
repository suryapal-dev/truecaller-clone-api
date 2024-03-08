import httpServer from "./src/httpServer/server.js"

const init = async () => {
    await httpServer.execute()
}

init().then(() => {
    console.log('Application started..')
})