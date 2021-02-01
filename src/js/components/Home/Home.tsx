import * as React from 'react';
import { v4 as uuidv } from 'uuid';

import { Element } from 'components/Element';
import { Content } from 'components/Grid';
import { IScreenElement, Screen } from 'components/Screen';
import { Toolbox } from 'components/Toolbox';

interface IState {
  activeScreenElement: string;
  sceneElements: IScreenElement[];
}

const elements: { [key: string]: string } = {
  1: '/img/logo.png',
  2: '/img/logo.png',
};

const elementsKeys = Object.keys(elements);

class Home extends React.Component<{}, IState> {
  state: IState = {
    activeScreenElement: null,
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
          onClick={() => this.onScreenElementClick(id)}
          onClickRight={() => this.onScreenElementRightClick(screenElement)}
        />
      ),
    };

    this.addScreenElement(screenElement);
  };

  onScreenElementClick = (id: string) =>
    this.setState({ activeScreenElement: id });

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

  render() {
    const { sceneElements } = this.state;

    return (
      <Content className='home' centerContent>
        <Screen elements={sceneElements} />

        <Toolbox position='left' items={this.elementsTemplates} />

        <Toolbox position='right' items={sceneElements} />

        <Toolbox position='bottom' items={sceneElements} />
      </Content>
    );
  }
}

export default Home;
