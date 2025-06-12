import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes } from "~/routes/index";
import { DefaultLayout } from "~/layout/DefaultLayout";
import { Fragment } from "react";
import { TokenExpirationProvider } from "./contexts/TokenExpirationContext/TokenExpirationContext";

function App() {
  return (
    <Router>
      <TokenExpirationProvider>
        <div className="App">
          <Routes>
            {publicRoutes.map((route, index) => {
              const Layout = route.layout === null ? Fragment : DefaultLayout;
              const Page = route.component;
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          </Routes>
        </div>
      </TokenExpirationProvider>
    </Router>
  );
}

export default App;
