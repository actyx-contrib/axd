import * as commandExists from 'command-exists'

export const axIsInstalled = async (): Promise<boolean> => {
    try {
        await commandExists(`ax`)
        return true
    } catch (error) {
        return false
    }

}