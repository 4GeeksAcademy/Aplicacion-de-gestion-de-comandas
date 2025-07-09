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
import OrdersDashboard from "./pages/OrdersDashboard";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import RequestReset from "./pages/RequestReset";
import TableMap from "./pages/TableMap";


export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* 🌐 RUTA PRINCIPAL con Layout */}
    
      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Login />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/private" element={<Private />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/request-reset-password" element={<RequestReset />} />
      <Route path="/table-map" element={<TableMap/>} />
      <Route path="/orders-dashboard" element={<OrdersDashboard />} />
    </>
  ),

  
);
