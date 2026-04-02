"use client"

import React, { useState } from 'react';
import styled from 'styled-components';

interface GlassRadioGroupProps {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const GlassRadioGroup: React.FC<GlassRadioGroupProps> = ({
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
      <div className="glass-radio-group">
        {options.map((option, index) => (
          <React.Fragment key={option}>
            <input
              type="radio"
              name="plan"
              id={`glass-${option.toLowerCase()}`}
              checked={selectedValue === option}
              onChange={() => handleChange(option)}
            />
            <label htmlFor={`glass-${option.toLowerCase()}`}>{option}</label>
          </React.Fragment>
        ))}
        <div className="glass-glider" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .glass-radio-group {
    display: flex;
    position: relative;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 1.25rem;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      inset 1px 1px 4px rgba(255, 255, 255, 0.1),
      0 8px 32px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    width: fit-content;
  }

  .glass-radio-group input {
    display: none;
  }

  .glass-radio-group label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    font-size: 14px;
    padding: 0.8rem 1.6rem;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: #e5e5e5;
    position: relative;
    z-index: 2;
    transition: color 0.3s ease-in-out;
  }

  .glass-radio-group label:hover {
    color: white;
  }

  .glass-radio-group input:checked + label {
    color: #fff;
  }

  .glass-glider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: calc(100% / 3);
    border-radius: 1.25rem;
    z-index: 1;
    transition:
      transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
      background 0.4s ease-in-out,
      box-shadow 0.4s ease-in-out;
  }

  /* Silver */
  #glass-silver:checked ~ .glass-glider {
    transform: translateX(0%);
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(224, 224, 224, 0.6));
    box-shadow:
      0 0 20px rgba(192, 192, 192, 0.4),
      0 0 10px rgba(255, 255, 255, 0.2) inset;
  }

  /* Gold */
  #glass-gold:checked ~ .glass-glider {
    transform: translateX(100%);
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 204, 0, 0.6));
    box-shadow:
      0 0 20px rgba(255, 215, 0, 0.4),
      0 0 10px rgba(255, 235, 150, 0.2) inset;
  }

  /* Platinum */
  #glass-platinum:checked ~ .glass-glider {
    transform: translateX(200%);
    background: linear-gradient(135deg, rgba(208, 231, 255, 0.3), rgba(160, 216, 255, 0.6));
    box-shadow:
      0 0 20px rgba(160, 216, 255, 0.4),
      0 0 10px rgba(200, 240, 255, 0.2) inset;
  }
`;

export default GlassRadioGroup;