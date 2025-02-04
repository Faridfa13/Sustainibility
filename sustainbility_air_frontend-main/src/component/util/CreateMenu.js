import { ROOT_LINK, API_LINK, APPLICATION_ID } from "./Constants";
import UseFetch from "./UseFetch";

const CreateMenu = async (role) => {
  try {
    const data = await UseFetch(API_LINK + "Utilities/GetListMenu", {
      username: "",
      role: role,
      application: APPLICATION_ID,
    });

    let lastHeadkey = "";
    const transformedMenu = [
      {
        head: "Main Dashboard", // Menu utama setelah login
        headkey: "dashboard",
        link: ROOT_LINK + "/dashboard",
        sub: [],
      },
      {
        head: "Beranda Sustainability Air",
        headkey: "beranda-air",
        link: ROOT_LINK + "/beranda-air",
        sub: [],
        isHidden: true,
      },
      {
        head: "Beranda Sustainability Listrik",
        headkey: "beranda",
        link: ROOT_LINK + "/",
        sub: [],
        isHidden: true,
      },
      {
        head: "Notifikasi",
        headkey: "notifikasi",
        link: ROOT_LINK + "/notifikasi",
        sub: [],
        isHidden: true,
      },
      {
        head: "Logout",
        headkey: "logout",
        link: ROOT_LINK + "/logout",
        sub: [],
      },
    ];

    data.forEach((item) => {
      if (item.parent === null || item.link === "#") {
        lastHeadkey = item.nama.toLowerCase().replace(/\s/g, "_");
        transformedMenu.push({
          head: item.nama,
          headkey: lastHeadkey,
          link: item.link === "#" ? item.link : ROOT_LINK + "/" + item.link,
          sub: [],
        });
      } else {
        const parent = transformedMenu.find((i) => i.headkey === lastHeadkey);
        if (parent) {
          parent.sub.push({
            title: item.nama,
            link: ROOT_LINK + "/" + item.link,
          });
        }
      }
    });

    return transformedMenu;
  } catch {
    return [];
  }
};

export default CreateMenu;
