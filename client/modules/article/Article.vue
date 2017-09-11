<template>
    <div>
        <Form :label-width="70" inline style="margin: 20px 20px 0 0;">
            <FormItem label="标题">
                <Input v-model="articleSearch.title" placeholder="请输入"></Input>
            </FormItem>
            <Button type="primary" @click="getArticle()">搜索</Button>
            <Button type="primary" @click="articleModule('add')" style="float:right;">新增</Button>
        </Form>
        <Table border :columns="tableTitle" :data="articleList"></Table>
        <Page :total="articleSearch.pageCount" :current="articleSearch.pageIndex" :page-size="10"
              @on-change="getArticle" style="margin: 20px"></Page>
        <Modal
                v-model="articleModuleShow"
                title="文章内容"
                @on-ok="dealArticle()">
            <Form :label-width="70" inline>
                <FormItem label="标题">
                    <Input v-model="articleSelected.title" placeholder="请输入"></Input>
                </FormItem>
                <FormItem label="来源">
                    <Input v-model="articleSelected.source" placeholder="请输入"></Input>
                </FormItem>
                <FormItem label="内容">
                    <div id="content" style="height: 200px;"></div>
                </FormItem>
            </Form>
        </Modal>
        <Modal
                v-model="detailModuleShow"
                title="文章详情">
            <h2 class="text-center">{{articleSelected.title}}</h2>
            <p class="text-center">来源：{{articleSelected.source}}</p>
            <br/>
            <div v-html='articleSelected.content'></div>
        </Modal>
        <Modal
                v-model="deleteModuleShow"
                @on-ok="deleteArticle()">
            <p>确定要删除这篇文章吗？</p>
        </Modal>
    </div>
</template>
<style scoped>
    .text-center {
        text-align: center;
    }
</style>
<script>
    import 'wangeditor/dist/js/wangEditor.min.js';
    export default {
        data () {
            return {
                //模态框显示，依次为文章编辑添加模态框、详情模态框、删除模态框
                articleModuleShow: false,
                detailModuleShow: false,
                deleteModuleShow: false,
                //文章模态框是编辑还是新增（add/edit）
                articleModuleShowType: 'none',
                tableTitle: [
                    {
                        title: '标题',
                        key: 'title',
                    },
                    {
                        title: '来源',
                        key: 'source'
                    },
                    {
                        title: '创建时间',
                        key: 'create_time'
                    },
                    {
                        title: '最近修改时间',
                        key: 'update_time'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 200,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.articleModule('edit', params.index)
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showArticleDetail(params.index)
                                        }
                                    }
                                }, '详情'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.toDeleteArticle(params.index)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                articleList: [],
                articleSearch: {
                    title: '',
                    startTime: 0,
                    endTime: new Date(),
                    pageSize: 10,
                    pageIndex: 1,
                    pageCount: 0,
                },
                articleSelected: {}
            }
        },
        methods: {
            articleModule(type, index){
                let _this = this;
                let contentHtml ;
                _this.articleModuleShow = true;
                _this.articleModuleShowType = type;
                _this.articleSelected = index >= 0 ? this.articleList[index] : {};
                contentHtml = type === 'add' ? '' : this.articleSelected.content;
                _this.editor.$txt.html(contentHtml)
            },
            dealArticle(){
                let _this = this;
                _this.articleSelected.content = _this.editor.$txt.html();
                if (_this.articleModuleShowType === 'add') {
                    _this.addArticle()
                } else if (_this.articleModuleShowType === 'edit') {
                    this.editArticle()
                }
            },
            showArticleDetail(index){
                let _this = this;
                _this.detailModuleShow = true;
                _this.articleSelected = _this.articleList[index];
            },
            toDeleteArticle(index){
                let _this = this;
                _this.deleteModuleShow = true;
                _this.articleSelected = this.articleList[index];
            },
            /**
             * editor初始化
             */
            initEditor() {
                let _this = this;
                _this.editor = new wangEditor('content');
                _this.editor.config.menus = [
                    'source',
                    'bold',
                    'underline',
                    'italic',
                    'strikethrough',
                    'eraser',
                    'forecolor',
                    'fontfamily',
                    'fontsize',
                    'head',
                    'unorderlist',
                    'orderlist',
                    'alignleft',
                    'aligncenter',
                    'alignright',
                    'link',
                    'unlink',
                    'table',
                    'emotion',
                    'undo'
                ];
                _this.editor.config.uploadImgUrl = 'message/api/uploadImage';
                _this.editor.create();
            },

            /**
             * 获取文章列表
             */
            getArticle(index){
                let _this = this;
                _this.articleSearch.pageIndex = index;
                _this.$http.get('api/articles', {params: _this.articleSearch}).then(function (res) {
                    let re = res.body;
                    if (re.status === 1) {
                        _this.articleList = re.datas;
                        _this.articleSearch.pageCount = re.totalCount;


                    }
                })
            },

            /**
             * 新增文章
             */
            addArticle(){
                let _this = this;
                _this.$http.post('api/articles', this.articleSelected).then(function (res) {
                    if (res.body.status === 1) {
                        _this.getArticle();
                    } else {
                        _this.$Message.error('新增文章失败');
                    }
                })
            },

            /**
             * 编辑文章
             */
            editArticle(){
                let _this = this;
                _this.$http.put('api/articles', this.articleSelected, {params: {id: this.articleSelected._id}}).then(function (res) {
                    if (res.body.status === 1) {
                        _this.getArticle();
                    } else {
                        _this.$Message.error('编辑失败');
                    }
                })
            },

            /**
             * 删除文章
             */
            deleteArticle(){
                let _this = this;
                _this.$http.delete('api/articles', {params: {id: _this.articleSelected._id}}).then(function (res) {
                    if (res.body.status === 1) {
                        _this.getArticle();
                    } else {
                        _this.$Message.error('删除失败');
                    }
                })
            },
        },

        mounted(){
            this.getArticle();
            this.initEditor();
        }
    }
</script>