using System;

namespace Streamin.Models
{
    public class Value
    {
        public int id { get; }

        public Value()
        {
            id = new Random().Next();
        }

        public override string ToString()
        {
            return $"The value is {id}.";
        }
    }
}
