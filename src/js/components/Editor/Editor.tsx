import * as React from 'react';
import { v4 as uuidv } from 'uuid';

import { Category } from 'components/Category';
import { Element } from 'components/Element';
import { Content } from 'components/Grid';
import { IScreenElement, Screen } from 'components/Screen';
import { TFrame, Timeline } from 'components/Timeline';
import { Toolbox } from 'components/Toolbox';

import Elements from 'js/elements';

const ANIMATION_SECONDS = 5;
const ANIMATION_FRAME_SECONDS = 0.2;

const animationFramesCount = ANIMATION_SECONDS / ANIMATION_FRAME_SECONDS;

interface IState {
  activeSceneElementId: string;
  activeFrameIndex: number;
  frames: TFrame[];
  sceneElements: IScreenElement[];
}

class Editor extends React.Component<{}, IState> {
  state: IState = {
    activeSceneElementId: null,
    activeFrameIndex: 0,
    frames: Array.from(Array(animationFramesCount)).map(() => ({})),
    sceneElements: [],
  };

  templatesByCategory = Object.keys(Elements).map(category => ({
    id: category,
    content: (
      <Category
        content={Elements[category].map((id: string) => (
          <Element
            image={id}
            key={id}
            onClick={() => this.onToolboxItemClick(id)}
          />
        ))}
      >
        {category}
      </Category>
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
          image={templateId}
          onClick={() => this.onScreenElementClick(id)}
          onClickRight={() => this.onScreenElementRightClick(id)}
        />
      ),
    };

    this.addScreenElement(screenElement);
  };

  onScreenElementClick = (id: string) =>
    this.setState({ activeSceneElementId: id });

  onScreenElementRightClick = (id: string) => this.removeElementFromScene(id);

  removeElementFromScene = (id: string) => {
    const { frames, sceneElements } = this.state;
    const index = sceneElements.findIndex(item => item.id === id);
    const newSceneElements = sceneElements
      .slice(0, index)
      .concat(sceneElements.slice(index + 1));
    const newFrames = [...frames];

    newFrames.forEach((frame, index) => {
      newFrames[index] = { ...frames[index] };
      delete newFrames[index][id];
    });

    this.setState({
      frames: newFrames,
      sceneElements: newSceneElements,
    });
  };

  addScreenElement = (element: IScreenElement) => {
    const { activeFrameIndex, sceneElements } = this.state;

    this.addElementToFrame(element, activeFrameIndex);
    this.setState({
      sceneElements: [...sceneElements, element],
    });
  };

  updateScreenElement = (element: IScreenElement) => {
    const { activeFrameIndex, frames, sceneElements } = this.state;
    const { id } = element;
    const index = sceneElements.findIndex(item => item.id === id);
    const newSceneElements = [...sceneElements];
    const newFrames = [...frames];

    newSceneElements[index] = element;
    newFrames[activeFrameIndex][id] = element;

    this.setState({
      activeSceneElementId: id,
      sceneElements: newSceneElements,
    });
  };

  deactivateScreenElement = () => this.setState({ activeSceneElementId: null });

  onFrameClick = (index: number) => this.setState({ activeFrameIndex: index });

  onFrameRightClick = (index: number) => {
    const {
      activeSceneElementId,
      activeFrameIndex,
      frames,
      sceneElements,
    } = this.state;

    if (activeSceneElementId) {
      const frameHasActiveElement = !!frames[activeFrameIndex][
        activeSceneElementId
      ];

      if (frameHasActiveElement) {
        this.removeElementFromFrame(activeSceneElementId, activeFrameIndex);
      } else {
        const activeElement = sceneElements.find(
          element => element.id === activeSceneElementId,
        );

        this.addElementToFrame(activeElement, activeFrameIndex);
      }
    }

    this.setState({ activeFrameIndex: index });
  };

  addElementToFrame = (element: IScreenElement, frameIndex: number) => {
    const newFrames = [...this.state.frames];

    newFrames[frameIndex][element.id] = element;

    this.setState({ frames: newFrames });
  };

  removeElementFromFrame = (id: string, frameIndex: number) => {
    const { frames } = this.state;
    const newFrames = [...frames];

    newFrames[frameIndex] = { ...frames[frameIndex] };

    delete newFrames[frameIndex][id];

    this.setState({ frames: newFrames });
  };

  render() {
    const {
      activeSceneElementId,
      activeFrameIndex,
      frames,
      sceneElements,
    } = this.state;

    return (
      <Content className='home' centerContent>
        <Screen
          activeElementId={activeSceneElementId}
          elements={Object.values(frames[activeFrameIndex])}
          onChangeElement={this.updateScreenElement}
          onScreenClick={this.deactivateScreenElement}
        />

        <Toolbox items={this.templatesByCategory} position='left' />

        <Toolbox
          activeItemId={activeSceneElementId}
          items={sceneElements}
          position='right'
          withScroll
        />

        <Toolbox position='bottom'>
          <Timeline
            activeElementId={activeSceneElementId}
            activeFrameIndex={activeFrameIndex}
            frames={frames}
            onFrameClick={this.onFrameClick}
            onFrameRightClick={this.onFrameRightClick}
            seconds={ANIMATION_SECONDS}
          />
        </Toolbox>
      </Content>
    );
  }
}

export default Editor;
