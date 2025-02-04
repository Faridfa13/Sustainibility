import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Cookies from "js-cookie";
import { decryptId } from "./component/util/Encryptor";
import { BASE_ROUTE, ROOT_LINK } from "./component/util/Constants";
import CreateMenu from "./component/util/CreateMenu";
import CreateRoute from "./component/util/CreateRoute.jsx";

import Container from "./component/backbone/Container";
import Header from "./component/backbone/Header";
import SideBar from "./component/backbone/SideBar";

import Guest from "./component/page/guest/Index";
import Login from "./component/page/login/Index";
import Logout from "./component/page/logout/Index";
import NotFound from "./component/page/not-found/Index";

export default function App() {
  const [listMenu, setListMenu] = useState([]);
  const [listRoute, setListRoute] = useState([]);
  const isLoginPage = window.location.pathname === "/login";
  const isGuestPage = window.location.pathname === "/guest";
  const isLogoutPage = window.location.pathname === "/logout";
  const cookie = Cookies.get("activeUser");

  // Jika berada di halaman login, guest, atau logout, render halaman tersebut
  if (isLoginPage) return <Login />;
  else if (isGuestPage) return <Guest />;
  else if (isLogoutPage) return <Logout />;
  
  // Jika tidak ada cookie, arahkan ke halaman login
  else if (!cookie) {
    window.location.href = "/login"; // Redirect ke halaman login
    return null; // Menghindari rendering halaman lebih lanjut
  } else {
    const userInfo = JSON.parse(decryptId(cookie));

    useEffect(() => {
      const getMenu = async () => {
        const menu = await CreateMenu(userInfo.role);
        const route = CreateRoute.filter((routeItem) => {
          const pathExistsInMenu = menu.some((menuItem) => {
            if (menuItem.link.replace(ROOT_LINK, "") === routeItem.path) {
              return true;
            }
            if (menuItem.sub && menuItem.sub.length > 0) {
              return menuItem.sub.some(
                (subItem) =>
                  subItem.link.replace(ROOT_LINK, "") === routeItem.path
              );
            }
            return false;
          });

          return pathExistsInMenu;
        });

        // Menambahkan route untuk halaman NotFound jika tidak ada kecocokan
        route.push({
          path: "/*",
          element: <NotFound />,
        });

        setListMenu(menu);
        setListRoute(route);
      };

      getMenu();
    }, []);

    return (
      <>
        {listRoute.length > 0 && (
          <>
            <Header displayName={userInfo.nama} roleName={userInfo.peran} />
            <div style={{ marginTop: "70px" }}></div>
            <div className="d-flex flex-row">
              <SideBar listMenu={listMenu} />
              <Container>
                <RouterProvider
                  router={createBrowserRouter(listRoute, {
                    basename: BASE_ROUTE,
                  })}
                />
              </Container>
            </div>
          </>
        )}
      </>
    );
  }
}
