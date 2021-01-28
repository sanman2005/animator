import * as React from 'react';
import { observer } from 'mobx-react';
import Comment, { IComment } from '../../models/comment';
import Account from '../../models/account';
import Lesson from '../../models/lesson';
import Button from '../Button';
import * as dayjs from 'dayjs';
import { InputText } from '../Input/Input';
import Form, { TFormData } from '../Form/Form';
import { Content } from '../Grid';
import cn from 'classnames';
import Icons from '../icons';
import Loading from '../Loading';
import { IPerson } from '../../models/person';
import { ModelStatus } from '../../models';
import { CSSTransition } from 'react-transition-group';

interface ICommentsState {
  commentsShownCount: number;
  commentReply: IComment;
  commentError: string;
  commentText: string;
}

interface IComments {
  [key: string]: IComment;
}

const commentsCountPage = 15;

@observer
class LessonComments extends React.Component<{}, ICommentsState> {
  state = {
    commentsShownCount: commentsCountPage,
    commentReply: null as IComment,
    commentError: '',
    commentText: '',
  };

  lessonId: string = '';
  commentsPrepared: IComment[] = null;
  commentsShownCount = this.state.commentsShownCount;

  showMoreComments = () => this.setState({
    commentsShownCount: this.commentsShownCount + commentsCountPage,
  })

  getCommentsTree = (comments: IComment[]) => {
    const commentsAll: IComments = {};
    const commentsTree: IComments = {};

    comments.forEach(item => commentsAll[item.id] = { ...item });

    Object.keys(commentsAll).forEach((id) => {
      if (commentsAll[id].parentId) {
        const parentId = commentsAll[id].parentId;
        const parent = commentsAll[parentId];
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }

          parent.children.push(commentsAll[id]);
        }
      } else {
        commentsTree[id] = commentsAll[id];
      }
    });

    return Object.keys(commentsTree).map(id => commentsTree[id]);
  }

  expandCommentsTree = (commentsTree: IComment[]): IComment[] => {
    const result: IComment[] = [];

    commentsTree.forEach((item) => {
      const { children } = item;

      result.push(
        item,
        ...(children ? this.expandCommentsTree(children) : []),
      );
    });

    return result;
  }

  renderComment = (item: IComment) => {
    const commentClass = cn('comment', {
      'comment--child': item.parentId,
    });
    const { author } = item;
    const { commentReply } = this.state;
    const isCurrentReply = commentReply === item;
    const accountData = Account.getData();

    const replyClass = 'comment__reply';
    const replyClassOpen = `${replyClass} ${replyClass}--open`;
    const commentForm = accountData.value
      ? (
        <CSSTransition
          in={isCurrentReply}
          timeout={300}
          unmountOnExit
          classNames={{
            enter: replyClassOpen,
            enterDone: replyClassOpen,
            exit: replyClass,
          }}>
          {this.renderCommentForm(accountData.value.user)}
        </CSSTransition>
      ) : (accountData.status === ModelStatus.fetching && <Loading />);

    return (
      <div className={commentClass} key={item.id}>
        <div className='comment__photo'>
          {author && author.photo
            ? <img src={author.photo} alt='Фото' />
            : <Icons.noPhoto />}
        </div>
        <div className='comment__main'>
          <span className='comment__main--title'>
            {author && <h3>{author.name}</h3>}
            <p>{dayjs(item.created).fromNow()}</p>
          </span>
          <div className='comment__main--text'>{item.message}</div>
          <Button
            onClick={() => this.commentAnswerHandler(item)}
            text={isCurrentReply ? 'Закрыть' : 'Ответить'}
            type='light' />
          {commentForm}
        </div>
      </div>
    );
  }

  commentAnswerHandler = (commentReply: IComment) => this.setState({
    commentReply: commentReply === this.state.commentReply ? null : commentReply,
  })

  async sendComment(data: TFormData, onSuccessHook: () => void) {
    const comment = {
      message: data.comment,
      parentId: this.state.commentReply && this.state.commentReply.idApi,
    };

    this.setState({ commentText: comment.message });

    try {
      await Comment.sendComment(comment);

      this.commentAnswerHandler(null);
      this.commentsPrepared = null;

      this.setState({ commentText: '' });

      Comment.allUpdate(Lesson);
      onSuccessHook();
    } catch (error) {
      this.setState({ commentError: 'Не удалось оставить комментарий' });
    }
  }

  renderCommentForm = (user: IPerson, text?: string) => (
    <div className='comments__form'>
      <div className='comments__form-img'>
        {user.photo ? (
          <img
            src={user.photo}
            alt={user.name} />
        ) : <Icons.noPhoto />}
      </div>
      <Form
        fields={{
          comment: <InputText label='Комментарий' required value={text} />,
        }}
        sendText='Опубликовать'
        onSubmit={(data: TFormData, onSuccessHook) => this.sendComment(data, onSuccessHook)}
        error={this.state.commentError}
        noFocus />
    </div>
  )

  render() {
    const lesson = Lesson.current;

    if (!lesson) {
      return null;
    }

    if (!lesson.value) {
      return lesson.status === 'fetching' && <Loading />;
    }

    const lessonId = lesson.value.idApi;

    if (!lessonId) {
      return null;
    }

    const itemsData = Comment.all(Lesson);
    const items = itemsData.value;

    if (!items) {
      return itemsData.status === ModelStatus.fetching && <Loading />;
    }

    const needUpdateComments = !this.commentsPrepared
      || this.lessonId !== lessonId
      || this.commentsPrepared.length !== items.length;

    if (needUpdateComments) {
      const commentsTree = this.getCommentsTree(items);

      this.lessonId = lessonId;
      this.commentsPrepared = this.expandCommentsTree(commentsTree);
    }

    const { commentsShownCount, commentText } = this.state;
    const { commentsPrepared } = this;
    const commentToRender = commentsPrepared.filter(
      (comment: IComment, index: number) =>
        index < commentsShownCount || comment.parentId,
    );
    const isComments = !!commentsPrepared.length;
    const noComments = <div className='comments__none'>Нет комментариев</div>;
    const accountData = Account.getData();

    const commentForm = accountData.value ? (
      <Content>
        {this.renderCommentForm(accountData.value.user, commentText)}
      </Content>
    ) : (accountData.status === ModelStatus.fetching && <Loading />);

    this.commentsShownCount = commentToRender.length;

    return (
      <div className='comments'>
        {commentForm}
        <Content title='Обсуждение урока' className='comments__wrapper'>
          {isComments ? (
            <>
              {commentToRender.map(this.renderComment)}
              {this.commentsShownCount < commentsPrepared.length && (
                <div className='comment__more' onClick={this.showMoreComments}>
                  + Показать ещё
                </div>
              )}
            </>
          ) : noComments}
        </Content>
      </div>
    );
  }
}

export default LessonComments;
