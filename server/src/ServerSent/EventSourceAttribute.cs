using Microsoft.AspNetCore.Mvc.Filters;

namespace ServerSent
{
    public class EventSourceAttribute : ActionFilterAttribute
    {
        public static EventSource StreamWrapper { get; private set; }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var response = context.HttpContext.Response;
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.ContentType = "text/event-stream";

            StreamWrapper = new EventSource(response.Body);
        }
    }
}
