import * as React from 'react';
import { v4 as uuidv } from 'uuid';
import * as GIFEncoder from 'gifencoder';

import { Category } from 'components/Category';
import { Element } from 'components/Element';
import { Content } from 'components/Grid';
import { IScreenElement, Screen } from 'components/Screen';
import { TFrame, Timeline } from 'components/Timeline';
import { Toolbox } from 'components/Toolbox';

import Elements from 'js/elements';

import { interpolateElementsStates } from './EditorHelpers';

import 'js/types.d.ts';

const ANIMATION_SECONDS = 5;
const ANIMATION_FRAME_SECONDS = 0.2;

const STORAGE_SCENE_KEY = 'scene';

const animationFramesCount = ANIMATION_SECONDS / ANIMATION_FRAME_SECONDS;

interface IEditorState {
  activeSceneElementId: string;
  activeFrameIndex: number;
  frames: TFrame[];
  playing: boolean;
  recording: boolean;
  recordResolution: IVector;
  sceneElements: IScreenElement[];
  screenElementsByFrames: IScreenElement[][];
}

class Editor extends React.Component<{}, IEditorState> {
  state: IEditorState = {
    activeSceneElementId: null,
    activeFrameIndex: 0,
    frames: [...Array(animationFramesCount)].map(() => ({})),
    playing: false,
    recording: false,
    recordResolution: { x: 0, y: 0 },
    sceneElements: [],
    screenElementsByFrames: [...Array(animationFramesCount)].map(() => []),
  };

  playTimeoutId: NodeJS.Timeout = null;

  screen: HTMLDivElement = null;
  gifEncoder: GIFEncoder = null;

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

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);

    this.onLoad();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  updateScene = (state: Partial<IEditorState>) =>
    this.setState(state as IEditorState, this.calculateScreenElements);

  onKeyDown = (event: KeyboardEvent) => {
    const handlers: { [key: string]: (event: KeyboardEvent) => void } = {
      KeyS: this.onSave,
      Space: this.onPlay,
    };

    if (handlers[event.code]) handlers[event.code](event);
  };

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
      content: this.renderElementContent(id, templateId),
    };

    this.addScreenElement(screenElement);
  };

  renderElementContent = (id: string, templateId: string) => (
    <Element
      image={templateId}
      onClick={() => this.onScreenElementClick(id)}
      onClickRight={() => this.onScreenElementRightClick(id)}
    />
  );

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

    this.updateScene({
      frames: newFrames,
      sceneElements: newSceneElements,
    });
  };

  addScreenElement = (element: IScreenElement) => {
    const { activeFrameIndex, sceneElements } = this.state;

    this.setState({ sceneElements: [...sceneElements, element] }, () =>
      this.addElementToFrame(element.id, activeFrameIndex),
    );
  };

  updateScreenElement = (element: IScreenElement) => {
    const { activeFrameIndex, frames } = this.state;
    const { id } = element;
    const newFrames = [...frames];

    newFrames[activeFrameIndex] = {
      ...frames[activeFrameIndex],
      [id]: element,
    };

    this.updateScene({
      activeSceneElementId: id,
      frames: newFrames,
    });
  };

  deactivateScreenElement = () => this.setState({ activeSceneElementId: null });

  onFrameClick = (index: number) => this.setState({ activeFrameIndex: index });

  onFrameRightClick = (frameIndex: number) => {
    const { activeSceneElementId, frames } = this.state;

    if (!activeSceneElementId) return;

    if (frames[frameIndex][activeSceneElementId]) {
      this.removeElementFromFrame(activeSceneElementId, frameIndex);
    } else {
      this.addElementToFrame(activeSceneElementId, frameIndex);
    }
  };

  addElementToFrame = (id: string, frameIndex: number) => {
    const { frames, sceneElements, screenElementsByFrames } = this.state;
    const newFrames = [...frames];
    const activeFrame = screenElementsByFrames[frameIndex];
    const byId = (element: IScreenElement) => element.id === id;

    newFrames[frameIndex] = {
      ...newFrames[frameIndex],
      [id]: activeFrame.find(byId) || sceneElements.find(byId),
    };

    this.updateScene({ frames: newFrames });
  };

  removeElementFromFrame = (id: string, frameIndex: number) => {
    const { frames } = this.state;
    const newFrames = [...frames];

    newFrames[frameIndex] = { ...frames[frameIndex] };

    delete newFrames[frameIndex][id];

    this.updateScene({ frames: newFrames });
  };

  changeElementSortIndex = (id: string, index: number) => {
    const { sceneElements } = this.state;
    const currentIndex = sceneElements.findIndex(el => el.id === id);
    const newSceneElements = [...sceneElements];

    newSceneElements[index] = sceneElements[currentIndex];
    newSceneElements[currentIndex] = sceneElements[index];

    this.updateScene({ sceneElements: newSceneElements });
  };

  calculateScreenElements = () => {
    const { frames, sceneElements } = this.state;
    const screenElementsByFrames = interpolateElementsStates(
      sceneElements,
      frames,
    );

    this.setState({ screenElementsByFrames });
  };

  onPlay = () => {
    const { frames, playing, recording } = this.state;

    if (playing) {
      clearInterval(this.playTimeoutId);
    } else {
      this.playTimeoutId = setTimeout(
        async () => {
          const { activeFrameIndex } = this.state;
          const isLastFrame = activeFrameIndex >= frames.length - 1;
          const nextIndex = isLastFrame ? 0 : activeFrameIndex + 1;

          if (recording) {
            if (isLastFrame) {
              this.setState({ playing: false, recording: false });
              this.saveRecord();

              return;
            }
          }

          this.setState(
            { activeFrameIndex: nextIndex, playing: false },
            this.onPlay,
          );
        },
        recording ? 0 : ANIMATION_FRAME_SECONDS * 1000,
      );
    }

    this.setState({ playing: !playing });
  };

  onSave = (event: KeyboardEvent) => {
    const { frames, sceneElements } = this.state;

    if (!event.ctrlKey) return;

    event.preventDefault();

    const data = { frames, sceneElements };

    localStorage.setItem(STORAGE_SCENE_KEY, JSON.stringify(data));
  };

  onLoad = () => {
    const data = localStorage.getItem(STORAGE_SCENE_KEY);

    if (!data) return;

    const { frames, sceneElements } = JSON.parse(data) as IEditorState;

    sceneElements.forEach(element => {
      const { id, idTemplate } = element;

      element.content = this.renderElementContent(id, idTemplate);

      frames.forEach(
        frame => frame[id] && (frame[id].content = element.content),
      );
    });

    this.updateScene({ frames, sceneElements });
  };

  setScreen = (node: HTMLDivElement) => {
    const { height, width } = node.getBoundingClientRect();

    this.setState({ recordResolution: { x: width, y: height } });
    this.screen = node;
  };

  setScreenshot = (context: CanvasRenderingContext2D) =>
    this.gifEncoder.addFrame(context);

  onRecord = async () => {
    const { recordResolution } = this.state;
    const gifEncoder = new GIFEncoder(recordResolution.x, recordResolution.y);
    // @ts-ignore
    const file = await window.showSaveFilePicker({
      types: [
        {
          description: 'Gif',
          accept: { 'image/gif': ['.gif'] },
        },
      ],
    });
    const stream = await file.createWritable();

    stream.on = () => {};
    stream.once = () => {};
    stream.emit = () => {};
    stream.end = () => stream.close();

    gifEncoder.createReadStream().pipe(stream);

    gifEncoder.start();
    gifEncoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    gifEncoder.setDelay(ANIMATION_FRAME_SECONDS * 1000); // frame delay in ms
    gifEncoder.setQuality(10); // image quality. 10 is default.

    this.gifEncoder = gifEncoder;
    this.setState({ activeFrameIndex: 0, recording: true }, this.onPlay);
  };

  saveRecord = () => this.gifEncoder.finish();

  render() {
    const {
      activeSceneElementId,
      activeFrameIndex,
      frames,
      playing,
      recording,
      recordResolution,
      sceneElements,
      screenElementsByFrames,
    } = this.state;

    return (
      <Content className='home' centerContent>
        <Screen
          activeElementId={activeSceneElementId}
          animationTime={playing ? ANIMATION_FRAME_SECONDS : 0}
          elements={screenElementsByFrames[activeFrameIndex]}
          getRef={this.setScreen}
          onChangeElement={this.updateScreenElement}
          onDrawCanvas={this.setScreenshot}
          onScreenClick={this.deactivateScreenElement}
          record={recording}
          recordResolution={recordResolution}
        />

        <Toolbox items={this.templatesByCategory} position='left' />

        <Toolbox
          activeItemId={activeSceneElementId}
          items={sceneElements}
          onChangeItemIndex={this.changeElementSortIndex}
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
            onPlay={this.onPlay}
            onRecord={this.onRecord}
            seconds={ANIMATION_SECONDS}
          />
        </Toolbox>
      </Content>
    );
  }
}

export default Editor;
