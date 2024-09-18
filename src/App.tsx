import { useEffect } from 'react'
import { Routes, Route } from 'react-router'
import { IntlProvider } from 'react-intl'
import { useAppDispatch, useAppSelector } from './app/store/hooks'
import SignIn from './features/auth/signin/page'
import SignUp from './features/auth/signup/page'
import Header from './components/header/header'
import Products from './features/products/products'
import { onAuthStateChangedListener } from './backend/firebase/api/auth'
// import { insertUserDataFromAuth } from "./backend/firebase/api/db-utils"
import { fetchProductsData } from '@/backend/firebase/api/db-utils'
import { insertProductsData } from '@/backend/firebase/api/db-utils'
import PRODUCTS_DATA from '@/backend/firebase/api/products-data'
import { setProducts } from '@/app/store/product/product.slice'
import { setCurrentUser, setCurrentLocale } from '@/app/store/user/user.slice'
import Footer from '@/components/footer/footer'
import CartProducts from '@/features/cart/cart'
import { LOCALES } from '@/i18n/locale'
import { DEFAULT_LOCALE } from '@/constants'
import { selectCurrentLocale } from '@/app/store/user/user.selector'
import '@/App.css'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeData = async () => {
      try {
        let products = await fetchProductsData()
        if (products.length === 0) {
          console.log('No products found. Inserting initial data...')
          await insertProductsData('products', PRODUCTS_DATA[0].items)
          console.log('Initial products data inserted successfully')
          products = await fetchProductsData()
        }
        dispatch(setProducts(products))
      } catch (error) {
        console.error('Error initializing products data:', error)
      }
    }

    initializeData()

    const unsubscribe = onAuthStateChangedListener((user) => {
      const serializableUser =
        user && (({ displayName, email }) => ({ displayName, email }))(user)
      dispatch(setCurrentUser(serializableUser))
    })

    dispatch(setCurrentLocale(navigator.language))
    return unsubscribe
  }, [dispatch])

  const userLanguage = useAppSelector(selectCurrentLocale)
  return (
    <IntlProvider
      messages={LOCALES[userLanguage]}
      locale={userLanguage}
      defaultLocale={DEFAULT_LOCALE}
    >
      <Header></Header>
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Products></Products>} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/cart" element={<CartProducts />} />
        </Routes>
      </div>
      <Footer></Footer>
    </IntlProvider>
  )
}

export default App
