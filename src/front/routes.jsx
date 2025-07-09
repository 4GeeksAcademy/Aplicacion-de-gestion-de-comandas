import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Login from "./pages/Login";
import Private from "./pages/Private";
import Signup from "./pages/Register";
import OrdersDashboard from "./pages/OrdersDashboard";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* 🌐 RUTA PRINCIPAL con Layout */}
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
        <Route path="/" element={<Home />} />
        <Route path="/single/:theId" element={<Single />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/private" element={<Private />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders-dashboard" element={<OrdersDashboard />} />
      </Route>

      {/*  RUTA AISLADA sin Layout */}
      <Route path="/orders-test" element={<OrdersDashboard />} />
    </>

    
  )
);
