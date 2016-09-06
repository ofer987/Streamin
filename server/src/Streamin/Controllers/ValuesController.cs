using Microsoft.AspNetCore.Mvc;

using Streamin.Repositories;

using ServerSent;

namespace Streamin.Controllers
{
    [EventSource]
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        // GET api/values
        [HttpGet]
        public void Get()
        {
            var repo = new ValuesRepository();

            var id = 10;
            for (var i = 0; i < id; i++)
            {
                var val = repo.GetNext();
                EventSourceAttribute.StreamWrapper.Write(val, "value");
            }
        }
    }
}
