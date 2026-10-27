using Xunit;

namespace JINF.Api.Tests;

// This test does not depend on your API code. It only proves that the test
// project builds and runs, so CI has something to execute.
public class SanityTests
{
    [Fact]
    public void TestProject_Runs()
    {
        Assert.True(true);
    }
}
