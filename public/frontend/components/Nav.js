import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from './User';
import { Fragment } from 'react';
import SignOut from './SignOut';
import CartCount from './CartCount';
import { Mutation } from 'react-apollo';
import { TOGGLE_CART_MUTATION } from '../components/Cart';

const Nav = () => (
  <User>
    {({ data: { me } }) => (
      <NavStyles>
        <Link href="/items">Shop</Link>
        {me && (
          <Fragment>
            <Link href="/sell">Sell</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/me">Account</Link>
            <SignOut />
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {toggleCart => (
                <button onClick={toggleCart}>
                  My Cart
                  <CartCount
                    count={me.cart.reduce(
                      (tally, cartItem) => tally + cartItem.quantity,
                      0
                    )}
                  />
                </button>
              )}
            </Mutation>
          </Fragment>
        )}

        {!me && <Link href="/signup">Sign In</Link>}
      </NavStyles>
    )}
  </User>
);

export default Nav;
