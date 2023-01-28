import React from "react";
import styled from "styled-components";

interface TabItemProps {
  className?: string,
  tab: chrome.tabs.Tab,
  group: chrome.tabGroups.TabGroup | undefined,
}

function getColor(colorName: string): string {
  const map = new Map(Object.entries({
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
  return map.get(colorName) || 'black';
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

const TabItemGroupIndicator = styled.div`
  flex-shrink: 0;
  margin-right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  opacity: 0.95;
  background-color: ${props => props.color};
`;

const TabItemFlexContainer = styled.div`
  display: flex;
  align-items: center;
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
    const url = new URL(this.props.tab.url!);
    const groupColor = this.props.group?.color.toString();
    return (
      <TabItemOutContainer>
        <a onClick={this.handleClick}>
          <TabItemFlexContainer>
            {groupColor && <TabItemGroupIndicator color={getColor(groupColor)} />}
            <TabItemTextContainer>
              <TabItemTitle>{this.props.tab.title}</TabItemTitle>
              <TabItemPath>{url.pathname}</TabItemPath>
            </TabItemTextContainer>
          </TabItemFlexContainer>
        </a>
      </TabItemOutContainer>);
  }
}

export default TabItem;
