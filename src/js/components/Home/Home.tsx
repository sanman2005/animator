import * as React from 'react';
import { v4 as uuidv } from 'uuid';

import { Element } from 'components/Element';
import { Content } from 'components/Grid';
import { IScreenElement, Screen } from 'components/Screen';
import { Toolbox } from 'components/Toolbox';

interface IState {
  activeSceneElementId: string;
  sceneElements: IScreenElement[];
}

const elements: { [key: string]: string } = {
  1: '/img/logo.png',
  2: '/img/logo.png',
};

const elementsKeys = Object.keys(elements);

class Home extends React.Component<{}, IState> {
  state: IState = {
    activeSceneElementId: null,
    sceneElements: [],
  };

  elementsTemplates = elementsKeys.map(id => ({
    id,
    content: (
      <Element
        key={id}
        image={elements[id]}
        onClick={() => this.onToolboxItemClick(id)}
      />
    ),
  }));

  onToolboxItemClick = (id: string) => {
    const screenElement: IScreenElement = {
      id: uuidv(),
      idToolbox: id,
      height: 10,
      width: 10,
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      content: (
        <Element
          image={elements[id]}
          onClick={() => this.onScreenElementClick(screenElement)}
          onClickRight={() => this.onScreenElementRightClick(screenElement)}
        />
      ),
    };

    this.addScreenElement(screenElement);
  };

  onScreenElementClick = (element: IScreenElement) =>
    this.setState({ activeSceneElementId: element.id });

  onScreenElementRightClick = (element: IScreenElement) => {
    const { sceneElements } = this.state;
    const index = sceneElements.indexOf(element);

    this.setState({
      sceneElements: sceneElements
        .slice(0, index)
        .concat(sceneElements.slice(index + 1)),
    });
  };

  addScreenElement = (element: IScreenElement) =>
    this.setState(({ sceneElements }) => ({
      sceneElements: [...sceneElements, element],
    }));

  updateScreenElement = (element: IScreenElement) => {
    const { sceneElements } = this.state;
    const index = sceneElements.findIndex(item => element.id === item.id);
    const newSceneElements = [...sceneElements];

    newSceneElements[index] = element;
    this.setState({
      activeSceneElementId: element.id,
      sceneElements: newSceneElements,
    });
  };

  render() {
    const { activeSceneElementId, sceneElements } = this.state;

    return (
      <Content className='home' centerContent>
        <Screen
          activeElementId={activeSceneElementId}
          elements={sceneElements}
          onChangeElement={this.updateScreenElement}
        />

        <Toolbox items={this.elementsTemplates} position='left' />

        <Toolbox
          activeItemId={activeSceneElementId}
          items={sceneElements}
          position='right'
        />

        <Toolbox items={sceneElements} position='bottom' />
      </Content>
    );
  }
}

export default Home;
