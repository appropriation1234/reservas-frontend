// src/authConfig.js

import { LogLevel } from "@azure/msal-browser";


export const msalConfig = {
    auth: {
        // 'Application (client) ID' do registo da sua aplicação no portal do Azure.
        clientId: "7e08829a-a710-4339-850b-a85b8581a1ce",
        
        // 'Directory (tenant) ID' do registo da sua aplicação no portal do Azure.
        authority: "https://login.microsoftonline.com/9b18a306-f5cc-4acb-9347-212f2f9e814a",
        
        // Este é o URL para o qual o utilizador será redirecionado após o login.
        redirectUri: "http://localhost:5173"
    },
    cache: {
        cacheLocation: "sessionStorage", // ou "localStorage" se quiser que o utilizador permaneça logado
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

/**
 * Scopes que a sua aplicação precisa para pedir acesso.
 * A Microsoft Graph API usa estes scopes para dar acesso aos dados do utilizador.
 * "User.Read" é o mais básico, que permite ler o perfil do utilizador logado.
 */
export const loginRequest = {
    scopes: ["User.Read"]
};