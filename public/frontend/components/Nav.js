import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from './User';
import { Fragment } from 'react';
import SignOut from './SignOut';

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
          </Fragment>
        )}

        {!me && <Link href="/signup">Sign In</Link>}
      </NavStyles>
    )}
  </User>
);

export default Nav;
