// using System;
using System.Threading;
// using System.Threading.Tasks;

using Streamin.Models;

namespace Streamin.Repositories
{
    public class ValuesRepository
    {
        public ValuesRepository()
        {

        }

        public Value GetNext()
        {
            // Sleep for 1 second
            Thread.Sleep(1000);

            return new Value();
        }
    }
}
