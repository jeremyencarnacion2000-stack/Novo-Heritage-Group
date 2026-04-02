"use client"

import React, { useState } from 'react';
import styled from 'styled-components';

interface VerticalRadioGroupProps {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const VerticalRadioGroup: React.FC<VerticalRadioGroupProps> = ({
  options,
  defaultValue,
  onChange,
  className = ""
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]);

  const handleChange = (value: string) => {
    setSelectedValue(value);
    onChange?.(value);
  };

  return (
    <StyledWrapper className={className}>
      <div className="radio-container">
        {options.map((option, index) => (
          <React.Fragment key={option}>
            <input
              id={`radio-${option.toLowerCase().replace(/\s+/g, '-')}`}
              name="radio"
              type="radio"
              checked={selectedValue === option}
              onChange={() => handleChange(option)}
            />
            <label htmlFor={`radio-${option.toLowerCase().replace(/\s+/g, '-')}`}>
              {option}
            </label>
          </React.Fragment>
        ))}
        <div className="glider-container">
          <div className="glider" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .radio-container {
    --main-color: #f7e479;
    --main-color-opacity: #f7e4791c;

    /* change this according inputs count */
    --total-radio: 3;

    display: flex;
    flex-direction: column;
    position: relative;
    padding-left: 0.5rem;
  }
  .radio-container input {
    cursor: pointer;
    appearance: none;
  }
  .radio-container .glider-container {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(27, 27, 27, 1) 50%,
      rgba(0, 0, 0, 0) 100%
    );
    width: 1px;
  }
  .radio-container .glider-container .glider {
    position: relative;
    height: calc(100% / var(--total-radio));
    width: 100%;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0%,
      var(--main-color) 50%,
      rgba(0, 0, 0, 0) 100%
    );
    transition: transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56);
  }
  .radio-container .glider-container .glider::before {
    content: "";
    position: absolute;
    height: 60%;
    width: 300%;
    top: 50%;
    transform: translateY(-50%);
    background: var(--main-color);
    filter: blur(10px);
  }
  .radio-container .glider-container .glider::after {
    content: "";
    position: absolute;
    left: 0;
    height: 100%;
    width: 150px;
    background: linear-gradient(
      90deg,
      var(--main-color-opacity) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  .radio-container label {
    cursor: pointer;
    padding: 1rem;
    position: relative;
    color: grey;
    transition: all 0.3s ease-in-out;
  }

  .radio-container input:checked + label {
    color: var(--main-color);
  }

  .radio-container input:nth-of-type(1):checked ~ .glider-container .glider {
    transform: translateY(0);
  }

  .radio-container input:nth-of-type(2):checked ~ .glider-container .glider {
    transform: translateY(100%);
  }

  .radio-container input:nth-of-type(3):checked ~ .glider-container .glider {
    transform: translateY(200%);
  }

  .radio-container input:nth-of-type(4):checked ~ .glider-container .glider {
    transform: translateY(300%);
  }

  .radio-container input:nth-of-type(5):checked ~ .glider-container .glider {
    transform: translateY(400%);
  }

  .radio-container input:nth-of-type(6):checked ~ .glider-container .glider {
    transform: translateY(500%);
  }

  .radio-container input:nth-of-type(7):checked ~ .glider-container .glider {
    transform: translateY(600%);
  }

  .radio-container input:nth-of-type(8):checked ~ .glider-container .glider {
    transform: translateY(700%);
  }

  .radio-container input:nth-of-type(9):checked ~ .glider-container .glider {
    transform: translateY(800%);
  }

  .radio-container input:nth-of-type(10):checked ~ .glider-container .glider {
    transform: translateY(900%);
  }
`;

export default VerticalRadioGroup;