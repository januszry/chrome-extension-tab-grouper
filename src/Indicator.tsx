import React from "react";
import styled from "styled-components";

interface IndicatorProps {
  color: string,
  title?: string,
}

const ColorIndicator = styled.div`
  flex-shrink: 0;
  margin-right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  opacity: 0.95;
  background-color: ${props => props.color};
`;

class Indicator extends React.Component<IndicatorProps, {}> {
  constructor(props: IndicatorProps | Readonly<IndicatorProps>) {
    super(props);
  }

  render(): React.ReactNode {
    return (<ColorIndicator color={this.props.color} title={this.props.title} />);
  }
}

export default Indicator;
