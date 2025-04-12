import React, { createContext, useEffect, useState, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { IUserInfos } from '../interfaces/user.infos.interface';

interface KeycloakContextProps {
  keycloak: Keycloak | null;
  authenticated: boolean;
  initialized: boolean;
  userInfos: IUserInfos | null;
}

const KeycloakContext = createContext<KeycloakContextProps | undefined>(undefined);

interface KeycloakProviderProps {
  children: React.ReactNode;
}

const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const isRun = useRef<boolean>(false);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [userInfos, setUserInfos] = useState<IUserInfos | null>(null);

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;

    const initKeycloak = async () => {
      const keycloackConfig = {
        url: 'http://localhost:8080', // TODO: to put in .env
        realm: 'Chess', // TODO: to put in .env
        clientId: 'chess-front' // TODO: to put in .env
      };
      const keycloakInstance: Keycloak = new Keycloak(keycloackConfig);

      try {
        const isAuthenticated = await keycloakInstance.init({
          onLoad: 'check-sso'
        });
        setAuthenticated(isAuthenticated);
        const infos = await keycloakInstance.loadUserInfo();
        setUserInfos(infos as IUserInfos); // Cast as it is not documented in the library
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setAuthenticated(false);
      }
      setKeycloak(keycloakInstance);
      setInitialized(true);
    };

    initKeycloak();
  }, []);

  return <KeycloakContext.Provider value={{ keycloak, authenticated, initialized, userInfos }}>{children}</KeycloakContext.Provider>;
};

export { KeycloakProvider, KeycloakContext };
