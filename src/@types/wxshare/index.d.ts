declare namespace wx {
    function config(param)

    function ready(fun)
    function error(fun)

    function onMenuShareAppMessage(param)

    function onMenuShareTimeline(param)
    function openLocation(param);
    function closeWindow();

    namespace miniProgram  {
        function switchTab(param)
        function navigateTo(param)
        function navigateBack()
    }
}
