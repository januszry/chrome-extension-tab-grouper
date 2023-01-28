import React from "react";
import styled from "styled-components";
import Indicator from "./Indicator";

export const colorMap = new Map(Object.entries({
  'grey': 'rgb(84, 88, 93)',
  'blue': 'rgb(25, 104, 229)',
  'red': 'rgb(212, 42, 33)',
  'yellow': 'rgb(248, 161, 0)',
  'green': 'rgb(23, 117, 49)',
  'pink': 'rgb(202, 23, 121)',
  'purple': 'rgb(151, 58, 242)',
  'cyan': 'rgb(0, 112, 120)',
  'orange': 'rgb(249, 133, 54)',
}));

const Container = styled.div`
  display: flex;
`;

interface ColorPickerProps {
  host: string,
  tabs: chrome.tabs.Tab[],
  refresh: () => void,
}

class ColorPicker extends React.Component<ColorPickerProps, {}> {

  constructor(props: ColorPickerProps | Readonly<ColorPickerProps>) {
    super(props);
    this.handleCreateGroup = this.handleCreateGroup.bind(this);
  }

  async handleCreateGroup(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    const color = event.target instanceof HTMLDivElement ? event.target.getAttribute('title') || undefined : undefined;
    const colorEnum = color as chrome.tabGroups.ColorEnum;
    const { host, tabs, refresh } = this.props;
    const tabIds = tabs.map(tab => tab.id!);
    if (tabIds.length === 0) {
      return;
    }
    const newGroup = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(newGroup, { title: host!, color: colorEnum });
    refresh();
  }

  render(): React.ReactNode {
    const items = new Array();
    colorMap.forEach((color, name) => {
      items.push(<Indicator color={color} title={name} />)
    });
    return (
      <Container onClick={this.handleCreateGroup}> {items} </Container>
    );
  }
}

export default ColorPicker;
