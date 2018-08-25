import React from 'react';
import PropTypes from 'prop-types';

const User = (props) => {
  return (
    <li className="users-list__user">
      <div className="user__image-wrapper">
        <img className="user__image" src={props.imgSrc} alt={`${props.name}\'s avatar`} />
      </div>
      <div className="user__info-wrapper">
        <h3 className="user__name">{props.name}</h3>
        <p className="user__sign">{props.sign}</p>
      </div>
    </li>
  );
};

User.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  sign: PropTypes.string
};

export default User;
