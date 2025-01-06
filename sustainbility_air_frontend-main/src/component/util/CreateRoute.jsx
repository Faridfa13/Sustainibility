import { lazy } from "react";

const Beranda = lazy(() => import("../page/beranda/Root"));
const BerandaAir = lazy(() => import("../page/beranda-air/Root"));
const MasterTagihan = lazy(() => import("../page/master-tagihan/Root"));
const MasterKomponenAir = lazy(() => import("../page/master-komponen-air/Root"));
const MasterLokasi = lazy(() => import("../page/master-lokasi/Root"));
const MasterEvaluasiTarget = lazy(() => import("../page/master-evaluasi-target/Root"));
const TransaksiPenggunaanAir = lazy(() => import("../page/transaksi-penggunaan/Root"));
const MasterRuangan = lazy(() => import("../page/master-ruangan/Root"));
const MasterKomponen = lazy(() => import("../page/master-komponen/Root"));
const TransaksiPenempatan = lazy(() => import("../page/transaksi-penempatan/Root"));
const TransaksiPenggunaanListrik = lazy(() => import ("../page/transaksi-penggunaanlistrik/Root"));
const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
const MasterKonvert = lazy(() => import("../page/master-convert/Root"));

const routeList = [
  {
    path: "/",
    element: <Beranda />,
  },
  {
    path: "/master_komponen",
    element: <MasterKomponen />,
  },
  {
    path: "/master_ruangan",
    element: <MasterRuangan />,
  },
  {
    path: "/master_convert",
    element: <MasterKonvert />,
  },
  {
    path: "/transaksi_penempatan",
    element: <TransaksiPenempatan />,
  },
  {
    path: "/penggunaan_listrik",
    element: <TransaksiPenggunaanListrik />,
  },
  {
    path: "/beranda-air",
    element: <BerandaAir />,
  },
  {
    path: "/notifikasi",
    element: <Notifikasi />,
  },
  {
    path: "/master_lokasi",
    element: <MasterLokasi />,
  },
  {
    path: "/master_komponenair",
    element: <MasterKomponenAir />,
  },
  {
    path: "/transaksi_penggunaan_air",
    element: <TransaksiPenggunaanAir />,
  },
  {
    path: "/master_evaluasi_target",
    element: <MasterEvaluasiTarget />,
  },
];

export default routeList;