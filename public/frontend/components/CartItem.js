import React from 'react';
import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import RemoveFromCart from './RemoveFromCart';

const CartItemWrapper = styled('li')`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`;

const CartItem = ({ cartItem }) => {
  // Check if that item exists
  if (!cartItem.item) {
    return (
      <CartItemWrapper>
        <p>This item has been removed</p>
        <RemoveFromCart id={cartItem.id} />
      </CartItemWrapper>
    );
  }
  return (
    <CartItemWrapper>
      <img src={cartItem.item.image} alt="" width="100px" />
      <div className="cart-item-details">
        <h3>{cartItem.item.title}</h3>
        <p>
          {formatMoney(cartItem.item.price * cartItem.quantity)}
          {' - '}
          <em>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)}
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemWrapper>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
};

export default CartItem;
