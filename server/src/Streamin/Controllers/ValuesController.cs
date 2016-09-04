using Microsoft.AspNetCore.Mvc;

using Streamin.Repositories;
using Streamin.EventSource;

namespace Streamin.Controllers
{
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        // GET api/values
        [HttpGet]
        public void Get()
        {
            var response = HttpContext.Response;
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.ContentType = "text/event-stream";

            var repo = new ValuesRepository();
            var streamer = new Streamer(response.Body);

            var id = 10;
            for (var i = 0; i < id; i++)
            {
                var val = repo.GetNext();
                streamer.Write(val, "value");
            }
        }
    }
}
