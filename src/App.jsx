import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Project from './pages/Project'

// El editor se descarga solo al entrar a /editar: no suma peso a la web
const Editor = lazy(() => import('./pages/Editor'))

function AnimatedRoutes() {
  const location = useLocation()

  // mode="wait": la página que sale termina su fundido antes de que entre la nueva
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<Project />} />
        <Route
          path="/editar"
          element={
            <Suspense fallback={<p className="eyebrow p-6">Abriendo el editor…</p>}>
              <Editor />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {/* reducedMotion="user": si el sistema pide menos movimiento, se apagan los desplazamientos */}
      <MotionConfig reducedMotion="user">
        <a
          href="#contenido"
          className="eyebrow sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
        >
          Saltar al contenido
        </a>
        <AnimatedRoutes />
      </MotionConfig>
    </BrowserRouter>
  )
}
