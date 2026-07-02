self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^\\/documentation\\/v0\\.25(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!api|universer-api|_next\\/static|_next\\/image|favicon.ico|assets).*))(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$",
    "originalSource": "/((?!api|universer-api|_next/static|_next/image|favicon.ico|assets).*)"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()