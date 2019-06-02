import React from 'react';
import { Code, Secured, Welcome } from '../pages/';
import { Route } from 'react-router-dom';
import { withAuth } from '../auth/AuthProvider';

const AppNavigation = () => {

    return (
        <>
            <Route exact path="/" component={Welcome}/>
            <Route exact path="/code" component={Code}/>
            <PrivateRoute path="/secured" component={Secured}/>
        </>
    );
};

const PrivateRoute = withAuth(({ context, component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={props => {
                // Check first if keycloak is initialized (might happen after logging, once the user is redirected to the app!)
                if (context.isInitialized) {
                    if (!context.isAuthenticated) {
                        context.login();
                        return;
                    }

                    return <Component {...props} />;
                } else {
                    // Show spinner maybe...
                    return <span>Loading</span>;
                }

            }
            }
        />
    );
});

export default AppNavigation;