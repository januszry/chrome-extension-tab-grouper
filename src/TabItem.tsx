import React from "react";
import styled from "styled-components";
import { colorMap } from "./ColorPicker";
import Indicator from "./Indicator";

interface TabItemProps {
  className?: string,
  tab: chrome.tabs.Tab,
  group: chrome.tabGroups.TabGroup | undefined,
  hit: boolean,
  refresh: () => void,
}

function getColor(colorName: string): string {
  return colorMap.get(colorName) || 'black';
}

const TabItemTitle = styled.h3`
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TabItemPath = styled.p`
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TabItemFlexContainer = styled.div`
  display: flex;
  align-items: center;
  opacity: ${props => props.unselectable == 'on' ? 0.2 : 1};
`;

const TabItemTextContainer = styled.div`
  min-width: 0;
`;

const TabItemOutContainer = styled.li`
  padding: 8px 10px;
  &:nth-child(odd) {
    background: #80808030;
  }
  &:nth-child(even) {
    background: #ffffff;
  }
`;

class TabItem extends React.Component<TabItemProps, {}> {
  constructor(props: TabItemProps | Readonly<TabItemProps>) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
    await chrome.tabs.update(this.props.tab.id!, { active: true });
    await chrome.windows.update(this.props.tab.windowId, { focused: true });
  }

  render() {
    const { tab, group, hit } = this.props;
    const url = new URL(tab.url!);
    const groupColor = group?.color.toString();
    return (
      <TabItemOutContainer>
        <a onClick={this.handleClick}>
          <TabItemFlexContainer unselectable={hit ? 'off' : 'on'}>
            {groupColor && <Indicator color={getColor(groupColor)} title={group?.title} />}
            <TabItemTextContainer>
              <TabItemTitle>{tab.title}</TabItemTitle>
              <TabItemPath>{url.pathname}</TabItemPath>
            </TabItemTextContainer>
          </TabItemFlexContainer>
        </a>
      </TabItemOutContainer>);
  }
}

export default TabItem;
