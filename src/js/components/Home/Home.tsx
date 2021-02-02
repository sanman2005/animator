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

const templates: { [key: string]: string } = {
  1: '/img/logo.png',
  2: '/img/logo.png',
};

const templatesKeys = Object.keys(templates);

class Home extends React.Component<{}, IState> {
  state: IState = {
    activeSceneElementId: null,
    sceneElements: [],
  };

  elementsTemplates = templatesKeys.map(id => ({
    id,
    content: (
      <Element
        image={templates[id]}
        onClick={() => this.onToolboxItemClick(id)}
      />
    ),
  }));

  onToolboxItemClick = (templateId: string) => {
    const id = uuidv();
    const screenElement: IScreenElement = {
      id,
      idTemplate: templateId,
      height: 10,
      width: 10,
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      content: (
        <Element
          image={templates[templateId]}
          onClick={() => this.onScreenElementClick(id)}
          onClickRight={() => this.onScreenElementRightClick(id)}
        />
      ),
    };

    this.addScreenElement(screenElement);
  };

  onScreenElementClick = (id: string) =>
    this.setState({ activeSceneElementId: id });

  onScreenElementRightClick = (id: string) => {
    const { sceneElements } = this.state;
    const index = sceneElements.findIndex(item => item.id === id);

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

  deactivateScreenElement = () => this.setState({ activeSceneElementId: null });

  render() {
    const { activeSceneElementId, sceneElements } = this.state;

    return (
      <Content className='home' centerContent>
        <Screen
          activeElementId={activeSceneElementId}
          elements={sceneElements}
          onChangeElement={this.updateScreenElement}
          onScreenClick={this.deactivateScreenElement}
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
