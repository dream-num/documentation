import type { ISlideData } from '@univerjs/core'
import { BasicShapes } from '@univerjs/core'

export const SLIDE_DATA: Partial<ISlideData> = {
  id: 'slide_test',
  title: 'UniverSlide',
  pageSize: {
    width: 960,
    height: 540,
  },
  body: {
    pages: {
      cover_1: {
        id: 'cover_1',
        pageType: 0,
        zIndex: 1,
        title: 'cover',
        description: 'this is first page, cover',
        pageBackgroundFill: {
          rgb: 'rgb(255,255,255)',
        },
        pageElements: {
          background1: {
            id: 'background1',
            zIndex: 0,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'background',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/jYGEpeogMHxvwoiSqIMMn_Picture1.jpg',
              },
            },
          },
          mask1: {
            id: 'mask1',
            zIndex: 1,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgba(0,0,0,0.7)',
                },
              },
            },
          },
          text1: {
            id: 'text1',
            zIndex: 2,
            left: 300,
            top: 200,
            width: 400,
            height: 100,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Univer slide',
              fs: 48,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
              bl: 1,
            },
          },
          centerRect1: {
            id: 'centerRect1',
            zIndex: 1,
            left: 378,
            top: 0,
            width: 204,
            height: 144,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(244,79,86)',
                },
              },
            },
          },
          year1: {
            id: 'year1',
            zIndex: 2,
            left: 430,
            top: 42,
            width: 130,
            height: 50,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: '2024',
              fs: 36,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
              bl: 1,
            },
          },
          content1: {
            id: 'content1',
            zIndex: 2,
            left: 80,
            top: 300,
            width: 780,
            height: 140,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'The concepts national income and national product have roughly the same value and can be used interchangeably if our interest is in their sum total which is measured as the market value of the total output of goods and services of an economy in a given period, usually a year.',
              fs: 10.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
              bl: 1,
            },
          },
        },
      },
      catalog_1: {
        id: 'catalog_1',
        pageType: 0,
        zIndex: 2,
        title: 'catalog',
        description: 'this is second page, catalog',
        pageBackgroundFill: {
          rgb: 'rgb(255,255,255)',
        },
        pageElements: {
          background1: {
            id: 'background1',
            zIndex: 0,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'background',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/jYGEpeogMHxvwoiSqIMMn_Picture1.jpg',
              },
            },
          },
          mask1: {
            id: 'mask1',
            zIndex: 1,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgba(0,0,0,0.7)',
                },
              },
            },
          },
          text1: {
            id: 'text1',
            zIndex: 3,
            left: 180,
            top: 240,
            width: 200,
            height: 40,
            title: 'Catalog',
            description: '',
            type: 2,
            richText: {
              text: 'Catalog',
              fs: 31.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
          centerRect1: {
            id: 'centerRect1',
            zIndex: 2,
            left: 140,
            top: 168,
            width: 203,
            height: 203,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(244,79,86)',
                },
              },
            },
          },
          firstRect1: {
            id: 'firstRect1',
            zIndex: 2,
            left: 547,
            top: 115,
            width: 44,
            height: 44,
            title: 'index1',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(244,79,86)',
                },
              },
            },
          },
          secondRect1: {
            id: 'secondRect1',
            zIndex: 2,
            left: 547,
            top: 210,
            width: 44,
            height: 44,
            title: 'index2',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(244,79,86)',
                },
              },
            },
          },
          thirdRect1: {
            id: 'thirdRect1',
            zIndex: 2,
            left: 547,
            top: 304,
            width: 44,
            height: 44,
            title: 'index2',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(244,79,86)',
                },
              },
            },
          },
          forth1: {
            id: 'forth1',
            zIndex: 2,
            left: 547,
            top: 397,
            width: 44,
            height: 44,
            title: 'index2',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(244,79,86)',
                },
              },
            },
          },
          first_index1: {
            id: 'first_index1',
            zIndex: 3,
            left: 557,
            top: 120,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: '01',
              fs: 21,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
              bl: 1,
            },
          },
          first_title1: {
            id: 'first_title1',
            zIndex: 3,
            left: 610,
            top: 115,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Strategic technology trends',
              fs: 15,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
              bl: 1,
            },
          },
          first_detail1: {
            id: 'first_detail1',
            zIndex: 3,
            left: 610,
            top: 140,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'How they impact business goals.',
              fs: 10.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
          second_index1: {
            id: 'second_index1',
            zIndex: 3,
            left: 557,
            top: 215,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: '02',
              fs: 21,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
              bl: 1,
            },
          },
          second_title1: {
            id: 'second_title1',
            zIndex: 3,
            left: 610,
            top: 210,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Technical profile',
              fs: 15,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
              bl: 1,
            },
          },
          second_detail1: {
            id: 'second_detail1',
            zIndex: 3,
            left: 610,
            top: 235,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'What the technologies are and do.',
              fs: 10.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
          third_index1: {
            id: 'third_index1',
            zIndex: 3,
            left: 557,
            top: 310,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: '03',
              fs: 21,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
              bl: 1,
            },
          },
          third_title1: {
            id: 'third_title1',
            zIndex: 3,
            left: 610,
            top: 305,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Opportunities',
              fs: 15,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
              bl: 1,
            },
          },
          third_detail1: {
            id: 'third_detail1',
            zIndex: 3,
            left: 610,
            top: 330,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'What benefits and outcomes they drive.',
              fs: 10.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
          forth_index1: {
            id: 'forth_index1',
            zIndex: 3,
            left: 557,
            top: 405,
            width: 44,
            height: 44,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: '04',
              fs: 21,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
              bl: 1,
            },
          },
          forth_title1: {
            id: 'forth_title1',
            zIndex: 3,
            left: 610,
            top: 400,
            width: 248,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Implementation steps',
              fs: 15,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
              bl: 1,
            },
          },
          forth_detail1: {
            id: 'forth_detail1',
            zIndex: 3,
            left: 610,
            top: 425,
            width: 300,
            height: 39,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Action plans for implementation.',
              fs: 10.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
        },
      },
      strategic_1: {
        id: 'strategic_1',
        pageType: 0,
        zIndex: 1,
        title: 'cover',
        description: 'this is third page, strategic',
        pageBackgroundFill: {
          rgb: 'rgb(255,255,255)',
        },
        pageElements: {
          background1: {
            id: 'background1',
            zIndex: 1,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgba(237,237,237,1)',
                },
                outline: {
                  outlineFill: {
                    rgb: 'rgba(198,198,198,1)',
                  },
                  weight: 1,
                },
              },
            },
          },
          titleIcon1: {
            id: 'titleIcon1',
            zIndex: 2,
            left: 48,
            top: 52,
            width: 35.1,
            height: 4.8,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/E1MC_gxuoxED7as5FCVcH_title.png',
              },
            },
          },
          title1: {
            id: 'title1',
            zIndex: 2,
            left: 44,
            top: 56,
            width: 454,
            height: 50,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Strategic technology trends',
              fs: 24,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          subTitle1: {
            id: 'subTitle1',
            zIndex: 2,
            left: 44,
            top: 93,
            width: 889,
            height: 46,
            title: 'subTitle',
            description: '',
            type: 2,
            richText: {
              text: 'We expect the 2023 trends to impact enterprise strategies in the coming three years by enabling organizations to address four key priorities:',
              fs: 13.5,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          chart1: {
            id: 'chart1',
            zIndex: 2,
            left: 53,
            top: 214,
            width: 125,
            height: 58,
            title: 'chart1',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(105,126,146)',
                },
              },
            },
          },
          chartTitle1: {
            id: 'chartTitle1',
            zIndex: 3,
            left: 53,
            top: 186,
            width: 84,
            height: 28,
            title: 'chartTitle1',
            description: '',
            type: 2,
            richText: {
              text: 'Optimize',
              fs: 12,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          chartNumber1: {
            id: 'chartNumber1',
            zIndex: 3,
            left: 63,
            top: 230,
            width: 61,
            height: 36,
            title: 'chartNumber1',
            description: '',
            type: 2,
            richText: {
              text: '20%',
              fs: 16.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
          chart2: {
            id: 'chart2',
            zIndex: 2,
            left: 178,
            top: 214,
            width: 428,
            height: 58,
            title: 'chart2',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(57,74,87)',
                },
              },
            },
          },
          chartTitle2: {
            id: 'chartTitle2',
            zIndex: 3,
            left: 178,
            top: 186,
            width: 59,
            height: 28,
            title: 'chartTitle2',
            description: '',
            type: 2,
            richText: {
              text: 'Scale',
              fs: 12,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          chartNumber2: {
            id: 'chartNumber2',
            zIndex: 3,
            left: 188,
            top: 230,
            width: 61,
            height: 36,
            title: 'chartNumber2',
            description: '',
            type: 2,
            richText: {
              text: '50%',
              fs: 16.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
          chart3: {
            id: 'chart3',
            zIndex: 2,
            left: 605,
            top: 214,
            width: 302,
            height: 58,
            title: 'chart3',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgb(244,79,86)',
                },
              },
            },
          },
          chartTitle3: {
            id: 'chartTitle3',
            zIndex: 3,
            left: 605,
            top: 186,
            width: 74,
            height: 28,
            title: 'chartTitle3',
            description: '',
            type: 2,
            richText: {
              text: 'Scale',
              fs: 12,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          chartNumber3: {
            id: 'chartNumber3',
            zIndex: 3,
            left: 615,
            top: 230,
            width: 61,
            height: 36,
            title: 'chartNumber3',
            description: '',
            type: 2,
            richText: {
              text: '30%',
              fs: 16.5,
              cl: {
                rgb: 'rgb(255,255,255)',
              },
            },
          },
          detailTitle1: {
            id: 'detailTitle1',
            zIndex: 3,
            left: 53,
            top: 326,
            width: 152,
            height: 28,
            title: 'detailTitle1',
            description: '',
            type: 2,
            richText: {
              text: 'Theme 1: Optimize',
              fs: 12,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          detailContent1: {
            id: 'detailContent1',
            zIndex: 3,
            left: 53,
            top: 363,
            width: 273,
            height: 54,
            title: 'detailContent1',
            description: '',
            type: 2,
            richText: {
              rich: {
                id: 'd',
                body: {
                  dataStream: 'Digital Immune System\rApplied Observability\r\n',
                  textRuns: [
                    {
                      st: 0,
                      ed: 20,
                      ts: {
                        fs: 9,
                      },
                    },
                    {
                      st: 22,
                      ed: 42,
                      ts: {
                        fs: 9,
                      },
                    },
                  ],
                  paragraphs: [
                    {
                      startIndex: 21,
                      bullet: {
                        listType: 'ORDER_LIST',
                        listId: 'orderList',
                        nestingLevel: 0,
                        textStyle: {
                          fs: 15,
                        },
                      },
                      paragraphStyle: {
                        spaceBelow: {
                          v: 15,
                        },
                      },
                    },
                    {
                      startIndex: 43,
                      bullet: {
                        listType: 'ORDER_LIST',
                        listId: 'orderList',
                        nestingLevel: 0,
                        textStyle: {
                          fs: 15,
                        },
                      },
                    },
                  ],
                },
                documentStyle: {
                  pageSize: {
                    width: 273,
                    height: 54,
                  },
                  marginTop: 2,
                  marginBottom: 2,
                  marginRight: 0,
                  marginLeft: 0,
                },
              },
            },
          },
          detailTitle2: {
            id: 'detailTitle2',
            zIndex: 3,
            left: 334,
            top: 326,
            width: 129,
            height: 28,
            title: 'detailTitle2',
            description: '',
            type: 2,
            richText: {
              text: 'Theme 2: Scale',
              fs: 12,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          detailContent2: {
            id: 'detailContent2',
            zIndex: 3,
            left: 334,
            top: 363,
            width: 273,
            height: 120,
            title: 'detailContent2',
            description: '',
            type: 2,
            richText: {
              rich: {
                id: 'd',
                body: {
                  dataStream: 'combine SaaS, PaaS and IaaS with tailored\rprovides a curated set of tools, capabilities and processes that are packaged for easy consumption by developers and end users\r\n',
                  textRuns: [
                    {
                      st: 0,
                      ed: 40,
                      ts: {
                        fs: 9,
                      },
                    },
                    {
                      st: 42,
                      ed: 167,
                      ts: {
                        fs: 9,
                      },
                    },
                  ],
                  paragraphs: [
                    {
                      startIndex: 41,
                      bullet: {
                        listType: 'ORDER_LIST',
                        listId: 'orderList',
                        nestingLevel: 0,
                        textStyle: {
                          fs: 15,
                        },
                      },
                      paragraphStyle: {
                        spaceBelow: {
                          v: 15,
                        },
                      },
                    },
                    {
                      startIndex: 168,
                      bullet: {
                        listType: 'ORDER_LIST',
                        listId: 'orderList',
                        nestingLevel: 0,
                        textStyle: {
                          fs: 15,
                        },
                      },
                    },
                  ],
                },
                documentStyle: {
                  pageSize: {
                    width: 273,
                    height: 120,
                  },
                  marginTop: 2,
                  marginBottom: 2,
                  marginRight: 0,
                  marginLeft: 0,
                },
              },
            },
          },
          detailTitle3: {
            id: 'detailTitle3',
            zIndex: 3,
            left: 652,
            top: 326,
            width: 143,
            height: 28,
            title: 'detailTitle3',
            description: '',
            type: 2,
            richText: {
              text: 'Theme 2: Scale',
              fs: 12,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          detailContent3: {
            id: 'detailContent3',
            zIndex: 3,
            left: 652,
            top: 363,
            width: 273,
            height: 130,
            title: 'detailContent3',
            description: '',
            type: 2,
            richText: {
              rich: {
                id: 'd',
                body: {
                  dataStream: 'SuperApps are more than composite applications that aggregate services.\rAdaptive AI allows for model behavior change post-deployment by using real-time feedback\r\n',
                  textRuns: [
                    {
                      st: 0,
                      ed: 70,
                      ts: {
                        fs: 9,
                      },
                    },
                    {
                      st: 72,
                      ed: 159,
                      ts: {
                        fs: 9,
                      },
                    },
                  ],
                  paragraphs: [
                    {
                      startIndex: 71,
                      bullet: {
                        listType: 'ORDER_LIST',
                        listId: 'orderList',
                        nestingLevel: 0,
                        textStyle: {
                          fs: 15,
                        },
                      },
                      paragraphStyle: {
                        spaceBelow: {
                          v: 15,
                        },
                      },
                    },
                    {
                      startIndex: 160,
                      bullet: {
                        listType: 'ORDER_LIST',
                        listId: 'orderList',
                        nestingLevel: 0,
                        textStyle: {
                          fs: 15,
                        },
                      },
                    },
                  ],
                },
                documentStyle: {
                  pageSize: {
                    width: 273,
                    height: 130,
                  },
                  marginTop: 2,
                  marginBottom: 2,
                  marginRight: 0,
                  marginLeft: 0,
                },
              },
            },
          },
        },
      },
      technology_1: {
        id: 'technology_1',
        pageType: 0,
        zIndex: 2,
        title: 'technology',
        description: 'this is second page, technology',
        pageBackgroundFill: {
          rgb: 'rgb(255,255,255)',
        },
        pageElements: {
          background1: {
            id: 'background1',
            zIndex: 1,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgba(237,237,237,1)',
                },
                outline: {
                  outlineFill: {
                    rgb: 'rgba(198,198,198,1)',
                  },
                  weight: 1,
                },
              },
            },
          },
          titleIcon1: {
            id: 'titleIcon1',
            zIndex: 2,
            left: 48,
            top: 52,
            width: 35.1,
            height: 4.8,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/E1MC_gxuoxED7as5FCVcH_title.png',
              },
            },
          },
          title1: {
            id: 'title1',
            zIndex: 2,
            left: 44,
            top: 56,
            width: 454,
            height: 50,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'Sustainable Technology',
              fs: 24,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          subTitle1: {
            id: 'subTitle1',
            zIndex: 2,
            left: 44,
            top: 93,
            width: 889,
            height: 46,
            title: 'subTitle',
            description: '',
            type: 2,
            richText: {
              text: 'Delivering technology alone will not be enough in 2023',
              fs: 13.5,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          picture1: {
            id: 'picture1',
            zIndex: 2,
            left: 53,
            top: 151,
            width: 258,
            height: 156,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/ITU9ANLPCLVZayK4cai3F_P1.png',
              },
            },
          },
          picture2: {
            id: 'picture2',
            zIndex: 2,
            left: 315,
            top: 151,
            width: 241,
            height: 156,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/SPY91aael53o6PASWMISg_P2.png',
              },
            },
          },
          picture3: {
            id: 'picture3',
            zIndex: 2,
            left: 53,
            top: 310,
            width: 258,
            height: 156,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/ejART8fy6hJATqRPEwv0i_P3.png',
              },
            },
          },
          picture4: {
            id: 'picture4',
            zIndex: 2,
            left: 310,
            top: 315,
            width: 241,
            height: 156,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/dMWplOwGie39Rduf0IFlm_P4.jpg',
              },
            },
          },
          detailTitle1: {
            id: 'detailTitle1',
            zIndex: 3,
            left: 580,
            top: 138,
            width: 75,
            height: 28,
            title: 'detailTitle1',
            description: '',
            type: 2,
            richText: {
              text: 'In short:',
              fs: 12,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          detailContent1: {
            id: 'detailContent1',
            zIndex: 3,
            left: 580,
            top: 167,
            width: 373,
            height: 81,
            title: 'detailContent1',
            description: '',
            type: 2,
            richText: {
              text: 'Investments in sustainable technology also have the potential to create greater operational resiliency and financial performance, while providing new avenues for growth.',
              fs: 9,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          listTitle1: {
            id: 'listTitle1',
            zIndex: 3,
            left: 580,
            top: 138,
            width: 75,
            height: 28,
            title: 'listTitle1',
            description: '',
            type: 2,
            richText: {
              text: 'In short:',
              fs: 12,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          listTitlePicture1: {
            id: 'listTitlePicture1',
            zIndex: 2,
            left: 572,
            top: 261,
            width: 53,
            height: 53,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/_Ae7XkF1f13c2bkxomlfV_icon1.png',
              },
            },
          },
          listContent1: {
            id: 'listContent1',
            zIndex: 3,
            left: 637,
            top: 265,
            width: 309,
            height: 61,
            title: 'listContent1',
            description: '',
            type: 2,
            richText: {
              text: 'Gartner’s Top 10 Strategic Technology Trends will help fulfill your business needs to optimize, scale or pioneer.',
              fs: 9,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          listTitlePicture2: {
            id: 'listTitlePicture2',
            zIndex: 2,
            left: 572,
            top: 341,
            width: 53,
            height: 53,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/G-OVAn8THqr-7u4OXZKJm_icon2.png',
              },
            },
          },
          listContent2: {
            id: 'listContent2',
            zIndex: 3,
            left: 637,
            top: 345,
            width: 309,
            height: 61,
            title: 'listContent2',
            description: '',
            type: 2,
            richText: {
              text: 'The trends allow you to align your technology innovation with the future strategic objectives of your enterprise.',
              fs: 9,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          listTitlePicture3: {
            id: 'listTitlePicture3',
            zIndex: 2,
            left: 572,
            top: 421,
            width: 53,
            height: 53,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/MPQJUz-b6yYfF-fa4TSSz_icon3.png',
              },
            },
          },
          listContent3: {
            id: 'listContent3',
            zIndex: 3,
            left: 637,
            top: 425,
            width: 309,
            height: 61,
            title: 'listContent3',
            description: '',
            type: 2,
            richText: {
              text: 'Investments in sustainable technology provide operational and financial benefits, and can create growth opportunities.',
              fs: 9,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
        },
      },
      richText_1: {
        id: 'richText_1',
        pageType: 0,
        zIndex: 2,
        title: 'business',
        description: 'this is fix page, rich text',
        pageBackgroundFill: {
          rgb: 'rgb(255,255,255)',
        },
        pageElements: {
          background1: {
            id: 'background1',
            zIndex: 1,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgba(237,237,237,1)',
                },
                outline: {
                  outlineFill: {
                    rgb: 'rgba(198,198,198,1)',
                  },
                  weight: 1,
                },
              },
            },
          },
          titleIcon1: {
            id: 'titleIcon1',
            zIndex: 2,
            left: 48,
            top: 52,
            width: 35.1,
            height: 4.8,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/E1MC_gxuoxED7as5FCVcH_title.png',
              },
            },
          },
          title1: {
            id: 'title1',
            zIndex: 2,
            left: 44,
            top: 56,
            width: 454,
            height: 50,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'The Work-like Editor',
              fs: 24,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          subTitle1: {
            id: 'subTitle1',
            zIndex: 2,
            left: 44,
            top: 93,
            width: 889,
            height: 46,
            title: 'subTitle',
            description: '',
            type: 2,
            richText: {
              text: 'Open source WYSIWYG editor built for the modern web',
              fs: 13.5,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          document: {
            id: 'table1',
            zIndex: 3,
            left: 30,
            top: 125,
            width: 900,
            height: 400,
            title: 'table1',
            description: '',
            type: 4,
            document: {
              id: 'd-en',
              drawings: {},
              drawingsOrder: [],
              body: {
                dataStream: 'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies\rEmerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and OPTIMIZED technologist delivery.\rThe 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: \rExpand immersive experiences\rAccelerate artificial intelligence (AI) automation\rOptimize technologist delivery \rThese technologies are expected to greatly impact business and society over the next two to 10 years, but will especially enable CIOs and IT leaders to deliver on digital business transformation. \rThree Hype Cycle themes to think about in 2022 and beyond\rThe 2022 Gartner Hype Cycle features emerging technologies and distills insights from more than 2,000 technologies into a succinct high-potential set. Most technologies have multiple use cases but enterprise architecture and technology innovation leaders should prioritize those with the greatest potential benefit for their organization. (They will also need to launch a proof-of-concept project to demonstrate the feasibility of a technology for their target use case. )\r\nThe benefit of these technologies is that they provide individuals with more control over their identities and data, and expand their range of experiences into virtual venues and ecosystems that can be integrated with digital currencies. These technologies also provide new ways to reach customers to strengthen or open up new revenue streams.\rDigital twin of the customer (DToC) is a dynamic virtual representation of a customer that simulates and learns to emulate and anticipate behavior. It can be used to modify and enhance the customer experience (CX) and support new digitalization efforts, products, services and opportunities. DToC will take five to 10 years until mainstream adoption but will be transformational to organizations.\rOther critical technologies in immersive experiences include the following:\rDecentralized identity (DCI) allows an entity (typically a human user) to control their own digital identity by leveraging technologies such as blockchain or other distributed ledger technologies (DLTs), along with digital wallets.\rDigital humans are interactive, AI-driven representations that have some of the characteristics, personality, knowledge and mindset of a human.\rInternal talent marketplaces match internal employees and, in some cases, a pool of contingent workers, to time-boxed projects and various work opportunities, with no recruiter involvement.\r\n',
                textRuns: [
                  {
                    st: 0,
                    ed: 67,
                    ts: {
                      bl: 1,
                      fs: 18,
                      cl: {
                        rgb: 'rgb(0, 40, 86)',
                      },
                    },
                  },
                  {
                    st: 68,
                    ed: 253,
                    ts: {
                      fs: 13.5,
                      cl: {
                        rgb: 'rgb(0, 40, 86)',
                      },
                    },
                  },
                  {
                    st: 254,
                    ed: 404,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 405,
                    ed: 433,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 434,
                    ed: 484,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 485,
                    ed: 516,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 517,
                    ed: 679,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 680,
                    ed: 713,
                    ts: {
                      fs: 12,
                      cl: {
                        rgb: 'rgb(0, 0, 211)',
                      },
                      bl: 1,
                    },
                  },
                  {
                    st: 714,
                    ed: 771,
                    ts: {
                      fs: 18,
                      cl: {
                        rgb: 'rgb(255,255,255)',
                      },
                      bg: {
                        rgb: 'rgb(0,40,86)',
                      },
                    },
                  },
                  {
                    st: 772,
                    ed: 1244,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 1246,
                    ed: 1589,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 1590,
                    ed: 1986,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 1987,
                    ed: 2062,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 2063,
                    ed: 2086,
                    ts: {
                      fs: 12,
                      cl: {
                        rgb: 'rgb(0, 0, 211)',
                      },
                      bl: 1,
                    },
                  },
                  {
                    st: 2086,
                    ed: 2294,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 2295,
                    ed: 2310,
                    ts: {
                      fs: 12,
                      cl: {
                        rgb: 'rgb(0, 0, 211)',
                      },
                      bl: 1,
                    },
                  },
                  {
                    st: 2310,
                    ed: 2438,
                    ts: {
                      fs: 12,
                    },
                  },
                  {
                    st: 2439,
                    ed: 2468,
                    ts: {
                      fs: 12,
                      cl: {
                        rgb: 'rgb(0, 0, 0)',
                      },
                      bl: 1,
                    },
                  },
                  {
                    st: 2468,
                    ed: 2628,
                    ts: {
                      fs: 12,
                    },
                  },
                ],
                paragraphs: [
                  {
                    startIndex: 67,
                  },
                  {
                    startIndex: 253,
                    paragraphStyle: {
                      spaceAbove: {
                        v: 30,
                      },
                      lineSpacing: 1.5,
                      suppressHyphenation: 0,
                    },
                  },
                  {
                    startIndex: 404,
                    paragraphStyle: {
                      spaceAbove: {
                        v: 20,
                      },
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 433,
                    bullet: {
                      listType: 'ORDER_LIST',
                      listId: 'b',
                      nestingLevel: 0,
                      textStyle: {
                        fs: 20,
                        cl: {
                          rgb: 'rgb(0, 255, 0)',
                        },
                      },
                    },
                    paragraphStyle: {
                      lineSpacing: 1.5,
                      spaceAbove: {
                        v: 20,
                      },
                    },
                  },
                  {
                    startIndex: 484,
                    bullet: {
                      listType: 'ORDER_LIST',
                      listId: 'b',
                      nestingLevel: 0,
                      textStyle: {
                        fs: 20,
                      },
                    },
                    paragraphStyle: {
                      spaceAbove: {
                        v: 10,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 516,
                    bullet: {
                      listType: 'ORDER_LIST',
                      listId: 'b',
                      nestingLevel: 0,
                      textStyle: {
                        fs: 20,
                      },
                    },
                    paragraphStyle: {
                      spaceAbove: {
                        v: 10,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 713,
                    paragraphStyle: {
                      spaceAbove: {
                        v: 20,
                      },
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 771,
                    paragraphStyle: {
                      spaceAbove: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 1244,
                    paragraphStyle: {
                      spaceAbove: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                      indentFirstLine: {
                        v: 20,
                      },
                    },
                  },
                  {
                    startIndex: 1589,
                    paragraphStyle: {
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 1986,
                    paragraphStyle: {
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 2062,
                    paragraphStyle: {
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                  },
                  {
                    startIndex: 2294,
                    paragraphStyle: {
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                    bullet: {
                      listType: 'BULLET_LIST',
                      listId: 'a',
                      nestingLevel: 0,
                      textStyle: {
                        fs: 20,
                      },
                    },
                  },
                  {
                    startIndex: 2438,
                    paragraphStyle: {
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                    bullet: {
                      listType: 'BULLET_LIST',
                      listId: 'a',
                      nestingLevel: 0,
                      textStyle: {
                        fs: 20,
                      },
                    },
                  },
                  {
                    startIndex: 2628,
                    paragraphStyle: {
                      indentFirstLine: {
                        v: 20,
                      },
                      lineSpacing: 1.5,
                    },
                    bullet: {
                      listType: 'BULLET_LIST',
                      listId: 'a',
                      nestingLevel: 0,
                      textStyle: {
                        fs: 20,
                      },
                    },
                  },
                ],
                sectionBreaks: [
                  {
                    startIndex: 1245,
                  },
                  {
                    startIndex: 2629,
                    columnProperties: [
                      {
                        width: 300,
                        paddingEnd: 5,
                      },
                    ],
                    columnSeparatorType: 1,
                    sectionType: 0,
                  },
                ],
                customBlocks: [],
              },
              documentStyle: {
                pageSize: {
                  width: 793.3333333333334,
                  height: 1122.6666666666667,
                },
                documentFlavor: 1,
                marginTop: 66.66666666666667,
                marginBottom: 66.66666666666667,
                marginRight: 66.66666666666667,
                marginLeft: 66.66666666666667,
                renderConfig: {
                  vertexAngle: 0,
                  centerAngle: 0,
                },
                autoHyphenation: 1,
                doNotHyphenateCaps: 0,
                consecutiveHyphenLimit: 2,
              },
            },
          },
        },
      },
      business_1: {
        id: 'business_1',
        pageType: 0,
        zIndex: 2,
        title: 'business',
        description: 'this is second page, business',
        pageBackgroundFill: {
          rgb: 'rgb(255,255,255)',
        },
        pageElements: {
          background1: {
            id: 'background1',
            zIndex: 1,
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            title: 'mask',
            description: '',
            type: 0,
            shape: {
              shapeType: BasicShapes.Rect,
              text: '',
              shapeProperties: {
                shapeBackgroundFill: {
                  rgb: 'rgba(237,237,237,1)',
                },
                outline: {
                  outlineFill: {
                    rgb: 'rgba(198,198,198,1)',
                  },
                  weight: 1,
                },
              },
            },
          },
          titleIcon1: {
            id: 'titleIcon1',
            zIndex: 2,
            left: 48,
            top: 52,
            width: 35.1,
            height: 4.8,
            title: 'title Icon',
            description: '',
            type: 1,
            image: {
              imageProperties: {
                contentUrl: 'https://release-univer.oss-cn-shenzhen.aliyuncs.com/template-resource/E1MC_gxuoxED7as5FCVcH_title.png',
              },
            },
          },
          title1: {
            id: 'title1',
            zIndex: 2,
            left: 44,
            top: 56,
            width: 454,
            height: 50,
            title: 'mask',
            description: '',
            type: 2,
            richText: {
              text: 'The Business Objectives',
              fs: 24,
              cl: {
                rgb: 'rgb(244,79,86)',
              },
            },
          },
          subTitle1: {
            id: 'subTitle1',
            zIndex: 2,
            left: 44,
            top: 93,
            width: 889,
            height: 46,
            title: 'subTitle',
            description: '',
            type: 2,
            richText: {
              text: 'What we hope to achieve in the short and long run',
              fs: 13.5,
              cl: {
                rgb: 'rgb(127,127,127)',
              },
            },
          },
          spreadSheet1: {
            id: 'table1',
            zIndex: 3,
            left: 30,
            top: 125,
            width: 900,
            height: 400,
            title: 'table1',
            description: '',
            type: 3,
            spreadsheet: {
              worksheet: {
                id: 'sheet-0001',
                name: 'sheet-0001',
                tabColor: 'blue',
                hidden: 0,
                rowCount: 12,
                columnCount: 11,
                zoomRatio: 1,
                scrollTop: 200,
                scrollLeft: 100,
                defaultColumnWidth: 93,
                defaultRowHeight: 40,
                cellData: {
                  1: {
                    1: {
                      v: 'Variants',
                      s: '2',
                    },
                    2: {
                      v: 'Platform',
                      s: '2',
                    },
                    3: {
                      v: 'UGC Buzz volume',
                      s: '2',
                    },
                    9: {
                      p: {
                        id: 'd',
                        body: {
                          dataStream: 'What’s New in the 2022 Gartner Hype Cycle for Emerging Technologies\rEmerging technologies for 2022 fit into three main themes: evolving/expanding immersive experiences, accelerated artificial intelligence automation, and optimized technologist delivery.\rThe 2022 Gartner Hype Cycle identifies 25 must-know emerging technologies designed to help enterprise architecture and technology innovation leaders: \rExpand immersive experiences\rAccelerate artificial intelligence (AI) automation\rOptimize technologist delivery \r\n',
                          textRuns: [
                            {
                              st: 0,
                              ed: 67,
                              ts: {
                                bl: 1,
                                fs: 18,
                                cl: {
                                  rgb: 'rgb(205, 40, 86)',
                                },
                              },
                            },
                            {
                              st: 68,
                              ed: 253,
                              ts: {
                                fs: 12,
                                cl: {
                                  rgb: 'rgb(0, 255, 86)',
                                },
                              },
                            },
                            {
                              st: 254,
                              ed: 404,
                              ts: {
                                fs: 10.5,
                                cl: {
                                  rgb: 'rgb(0, 255, 255)',
                                },
                              },
                            },
                            {
                              st: 405,
                              ed: 433,
                              ts: {
                                fs: 12,
                                cl: {
                                  rgb: 'rgb(255, 255, 86)',
                                },
                              },
                            },
                            {
                              st: 434,
                              ed: 484,
                              ts: {
                                fs: 12,
                                cl: {
                                  rgb: 'rgb(0, 255, 186)',
                                },
                              },
                            },
                            {
                              st: 485,
                              ed: 515,
                              ts: {
                                fs: 12,
                                cl: {
                                  rgb: 'rgb(60, 255, 86)',
                                },
                              },
                            },
                          ],
                          paragraphs: [
                            {
                              startIndex: 67,
                              paragraphStyle: {
                                horizontalAlign: 1,
                              },
                            },
                            {
                              startIndex: 253,
                              paragraphStyle: {
                                spaceAbove: {
                                  v: 20,
                                },
                                indentFirstLine: {
                                  v: 20,
                                },
                                horizontalAlign: 1,
                              },
                            },
                            {
                              startIndex: 404,
                              paragraphStyle: {
                                spaceAbove: {
                                  v: 20,
                                },
                                indentFirstLine: {
                                  v: 20,
                                },
                                horizontalAlign: 1,
                              },
                            },
                            {
                              startIndex: 433,
                              bullet: {
                                listType: 'BULLET_LIST',
                                listId: 'testBullet',
                                nestingLevel: 0,
                                textStyle: {
                                  fs: 15,
                                },
                              },
                              paragraphStyle: {
                                lineSpacing: 1.5,
                                horizontalAlign: 1,
                              },
                            },
                            {
                              startIndex: 484,
                              bullet: {
                                listType: 'BULLET_LIST',
                                listId: 'testBullet',
                                nestingLevel: 0,
                                textStyle: {
                                  fs: 15,
                                },
                              },
                              paragraphStyle: {
                                lineSpacing: 1.5,
                                horizontalAlign: 1,
                              },
                            },
                            {
                              startIndex: 516,
                              bullet: {
                                listType: 'BULLET_LIST',
                                listId: 'testBullet',
                                nestingLevel: 0,
                                textStyle: {
                                  fs: 15,
                                },
                              },
                              paragraphStyle: {
                                lineSpacing: 1.5,
                                horizontalAlign: 1,
                              },
                            },
                          ],
                          sectionBreaks: [
                            {
                              startIndex: 517,
                              columnProperties: [
                                {
                                  width: 200,
                                  paddingEnd: 5,
                                },
                              ],
                              columnSeparatorType: 1,
                              sectionType: 0,
                            },
                          ],
                        },
                        documentStyle: {
                          pageSize: {
                            width: 186,
                            height: undefined,
                          },
                          marginTop: 0,
                          marginBottom: 2,
                          marginRight: 2,
                          marginLeft: 2,
                          renderConfig: {
                            horizontalAlign: 1,
                            verticalAlign: 2,
                            centerAngle: 0,
                            vertexAngle: 0,
                            wrapStrategy: 3,
                            zeroWidthParagraphBreak: 1,
                          },
                        },
                      },
                      s: '6',
                    },
                  },
                  2: {
                    3: {
                      v: 'Jul\'21',
                      s: '1',
                    },
                    4: {
                      v: 'Aug\'21',
                      s: '1',
                    },
                    5: {
                      v: 'Sep\'21',
                      s: '1',
                    },
                    6: {
                      v: 'Oct\'21',
                      s: '1',
                    },
                    7: {
                      v: 'Nov\'21',
                      s: '1',
                    },
                    8: {
                      v: 'Dec\'21',
                      s: '1',
                    },
                  },
                  3: {
                    1: {
                      v: 'Eleva',
                      s: '3',
                    },
                    2: {
                      v: 'Amazon',
                      s: '4',
                    },
                    3: {
                      v: '4',
                      s: '5',
                    },
                    4: {
                      v: '145',
                      s: '5',
                    },
                    5: {
                      v: '44',
                      s: '5',
                    },
                    6: {
                      v: '20',
                      s: '5',
                    },
                    7: {
                      v: '7',
                      s: '5',
                    },
                    8: {
                      v: '12',
                      s: '5',
                    },
                  },
                  4: {
                    2: {
                      v: 'Google',
                      s: '4',
                    },
                    3: {
                      v: '2',
                      s: '5',
                    },
                    4: {
                      v: '6',
                      s: '5',
                    },
                    5: {
                      v: '5',
                      s: '5',
                    },
                    6: {
                      v: '6',
                      s: '5',
                    },
                    7: {
                      v: '12',
                      s: '5',
                    },
                    8: {
                      v: '3113',
                      s: '5',
                    },
                  },
                  5: {
                    2: {
                      v: 'Amazon',
                      s: '4',
                    },
                    3: {
                      v: '14',
                      s: '5',
                    },
                    4: {
                      v: '13',
                      s: '5',
                    },
                    5: {
                      v: '6',
                      s: '5',
                    },
                    6: {
                      v: '6',
                      s: '5',
                    },
                    7: {
                      v: '11',
                      s: '5',
                    },
                    8: {
                      v: '2',
                      s: '5',
                    },
                  },
                  6: {
                    1: {
                      v: 'Similac',
                      s: '3',
                    },
                    2: {
                      v: 'SaleForce',
                      s: '4',
                    },
                    3: {
                      v: '451',
                      s: '5',
                    },
                    4: {
                      v: '255',
                      s: '5',
                    },
                    5: {
                      v: '72',
                      s: '5',
                    },
                    6: {
                      v: '23',
                      s: '5',
                    },
                    7: {
                      v: '163',
                      s: '5',
                    },
                    8: {
                      v: '22',
                      s: '5',
                    },
                  },
                  7: {
                    2: {
                      v: 'Oracle',
                      s: '4',
                    },
                    3: {
                      v: '0',
                      s: '5',
                    },
                    4: {
                      v: '1',
                      s: '5',
                    },
                    5: {
                      v: '1136',
                      s: '5',
                    },
                    6: {
                      v: '11',
                      s: '5',
                    },
                    7: {
                      v: '2',
                      s: '5',
                    },
                    8: {
                      v: '1',
                      s: '5',
                    },
                  },
                  8: {
                    2: {
                      v: 'Apple',
                      s: '4',
                    },
                    3: {
                      v: '7',
                      s: '5',
                    },
                    4: {
                      v: '2',
                      s: '5',
                    },
                    5: {
                      v: '10',
                      s: '5',
                    },
                    6: {
                      v: '5',
                      s: '5',
                    },
                    7: {
                      v: '6',
                      s: '5',
                    },
                    8: {
                      v: '3',
                      s: '5',
                    },
                  },
                  9: {
                    1: {
                      v: 'TC',
                      s: '3',
                    },
                    2: {
                      v: 'IBM',
                      s: '4',
                    },
                    3: {
                      v: '1',
                      s: '5',
                    },
                    4: {
                      v: '12',
                      s: '5',
                    },
                    5: {
                      v: '2',
                      s: '5',
                    },
                    6: {
                      v: '1',
                      s: '5',
                    },
                    7: {
                      v: '1',
                      s: '5',
                    },
                    8: {
                      v: '1',
                      s: '5',
                    },
                  },
                  10: {
                    2: {
                      v: 'Google',
                      s: '4',
                    },
                    3: {
                      v: '26',
                      s: '5',
                    },
                    4: {
                      v: '33',
                      s: '5',
                    },
                    5: {
                      v: '33',
                      s: '5',
                    },
                    6: {
                      v: '6',
                      s: '5',
                    },
                    7: {
                      v: '22',
                      s: '5',
                    },
                    8: {
                      v: '8',
                      s: '5',
                    },
                  },
                },
                mergeData: [
                  {
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                  },
                  {
                    startRow: 1,
                    endRow: 2,
                    startColumn: 2,
                    endColumn: 2,
                  },
                  {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 3,
                    endColumn: 8,
                  },
                  {
                    startRow: 3,
                    endRow: 5,
                    startColumn: 1,
                    endColumn: 1,
                  },
                  {
                    startRow: 6,
                    endRow: 8,
                    startColumn: 1,
                    endColumn: 1,
                  },
                  {
                    startRow: 9,
                    endRow: 10,
                    startColumn: 1,
                    endColumn: 1,
                  },
                  {
                    startRow: 1,
                    endRow: 10,
                    startColumn: 9,
                    endColumn: 10,
                  },
                ],
                rowData: {
                  0: {
                    h: 20,
                  },
                },
                columnData: {
                  0: {
                    w: 20,
                  },
                  2: {
                    w: 120,
                  },
                  3: {
                    w: 60,
                  },
                  4: {
                    w: 60,
                  },
                  5: {
                    w: 60,
                  },
                  6: {
                    w: 60,
                  },
                  7: {
                    w: 60,
                  },
                  8: {
                    w: 60,
                  },
                },
                showGridlines: 0,
                rowHeader: {
                  width: 46,
                  hidden: 0,
                },
                columnHeader: {
                  height: 20,
                  hidden: 0,
                },
                rightToLeft: 0,
                freeze: {
                  xSplit: 0,
                  ySplit: 0,
                  startRow: -1,
                  startColumn: -1,
                },
              },
              styles: {
                1: {
                  vt: 2,
                  ht: 2,
                  bl: 1,
                  fs: 10.5,
                  bg: {
                    rgb: 'rgb(105,126,146)',
                  },
                  cl: {
                    rgb: 'rgb(255,255,255)',
                  },
                },
                2: {
                  vt: 2,
                  ht: 2,
                  bl: 1,
                  fs: 15,
                  bg: {
                    rgb: 'rgb(244,79,86)',
                  },
                  cl: {
                    rgb: 'rgb(255,255,255)',
                  },
                  bd: {
                    t: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    l: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    r: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    b: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                  },
                },
                3: {
                  vt: 2,
                  bg: {
                    rgb: 'rgb(105,126,146)',
                  },
                  cl: {
                    rgb: 'rgb(255,255,255)',
                  },
                  fs: 10.5,
                  ht: 2,
                  bd: {
                    t: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    l: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    r: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    b: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                  },
                },
                4: {
                  fs: 9,
                  vt: 2,
                  pd: {
                    l: 5,
                  },
                  ht: 2,
                  bd: {
                    t: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    l: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    r: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    b: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                  },
                },
                5: {
                  ht: 2,
                  vt: 2,
                  bd: {
                    t: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    l: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    r: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    b: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                  },
                },
                6: {
                  ht: 1,
                  vt: 2,
                  tb: 3,
                  bg: {
                    rgb: 'rgba(244,79,86)',
                  },
                  cl: {
                    rgb: 'rgb(255,255,255)',
                  },
                  bd: {
                    t: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    l: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    r: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                    b: {
                      s: 1,
                      cl: {
                        rgb: 'rgb(217,217,217)',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    pageOrder: [
      'cover_1',
      'catalog_1',
      'strategic_1',
      'technology_1',
      'richText_1',
      'business_1',
    ],
  },
}
